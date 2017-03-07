'use strict';

// see https://github.com/nodejs/node/blob/master/lib/module.js
// and https://github.com/nodejs/node/blob/master/lib/internal/module.js
const Module = module.constructor;

const boundCachedSym = Symbol();
const invalidateCallbacksSym = Symbol();
const validateCallbacksSym = Symbol();
const invalid = Symbol();

function toPrimitive(value) {

	var valueToPrimitive = value[Symbol.toPrimitive];
	if ( typeof(valueToPrimitive) === 'function' )
		return valueToPrimitive;
	
	return function(hint) {
		
		if ( hint === 'number' )
			return Number(value);
		if ( hint === 'string' )
			return String(value);

		if ( typeof(value) === 'object' ) {
			
			var val = value.valueOf();
			if ( typeof(val) === 'object' )
				return String(val);
			return val;
		}
		
		return value;
	}
}

function hasInstance(ctor) {
	return function(instance) {
		
		return instance instanceof ctor;	
	}
}

function bindSetProto(fct, value) {

	function bound() {
		
		return fct.apply(value, arguments);
	}
	Object.setPrototypeOf(bound, fct); // see test "exports property on function"
	delete bound.name; // preserves the original function name
	return bound;
}


Module.invalidate = function() {
	
	for ( var filename in Module._cache )
		if ( 'invalidate' in Module._cache[filename] )
			Module._cache[filename].invalidate();
}

Module.invalidateByExports = function(exports) {
	
	for ( var filename in Module._cache )
		if ( Module._cache[filename].exports === exports )
			Module._cache[filename].invalidate();
}

Module.prototype.invalidateByPath = function(path) {
	
	Module._cache[Module._resolveFilename(path, this, this.parent === null)].invalidate();
}

Module.prototype.invalidate = function() {

	if ( !this.invalidable )
		return;
	
	if ( invalidateCallbacksSym in this ) {
		
		var validateCallbacks = this[validateCallbacksSym] || (this[validateCallbacksSym] = new Set);

		this[invalidateCallbacksSym].forEach(callback => {
			
			var validateCallback = callback(this._exports);
			if ( typeof(validateCallback) === 'function' )
				validateCallbacks.add(validateCallback);
		});
		this[invalidateCallbacksSym].clear();
	}
	
	this._exports = invalid;
}

Module.prototype.onInvalidate = function(callback) {
	
	var invalidateCallbacks = this[invalidateCallbacksSym] || (this[invalidateCallbacksSym] = new Set);
	return invalidateCallbacks.add(callback).delete.bind(invalidateCallbacks, callback);
}

function reload(mod) {

	mod._exports = {}; // resets _exports
	mod.loaded = false;
	mod.load(mod.filename);
	
	if ( validateCallbacksSym in mod ) {
		
		mod[validateCallbacksSym].forEach(callback => callback(mod._exports) );
		mod[validateCallbacksSym].clear();
	}
}


function createProxy(mod) {
	
	return new Proxy(function() {}, {

		getPrototypeOf: function(target) {
			
			mod._exports === invalid && reload(mod);
			return Reflect.getPrototypeOf(mod._exports);
		},
		
		setPrototypeOf: function(target, prototype) {
			
			mod._exports === invalid && reload(mod);
			return Reflect.setPrototypeOf(mod._exports, prototype);
		},
		
		isExtensible: function(target) {
			
			mod._exports === invalid && reload(mod);
			return Reflect.isExtensible(mod._exports);
		},
		
		preventExtensions: function(target) {
			
			mod._exports === invalid && reload(mod);
			return Reflect.preventExtensions(mod._exports);
		},
		
		getOwnPropertyDescriptor: function(target, prop) {
			
			mod._exports === invalid && reload(mod);

			if ( prop === 'prototype' && typeof(mod._exports) !== 'function' ) // see ownKeys
				return {};
			return Reflect.getOwnPropertyDescriptor(mod._exports, prop);
		},
		
		defineProperty: function(target, property, descriptor) {
			
			mod._exports === invalid && reload(mod);
			return Reflect.defineProperty(mod._exports, property, descriptor);
		},
		
		has: function(target, prop) {
			
			mod._exports === invalid && reload(mod);
			return Reflect.has(mod._exports, prop);
		},
		
		get: function(target, property) {
			
			mod._exports === invalid && reload(mod);
			
			if ( property === Symbol.hasInstance )
				return hasInstance(mod._exports);
			if ( property === Symbol.toPrimitive )
				return toPrimitive(mod._exports);
			
			// see http://stackoverflow.com/questions/42496414/illegal-invocation-error-using-es6-proxy-and-node-js
			// see https://github.com/nodejs/node/issues/11629 (Illegal invocation error using ES6 Proxy and node.js)
			// see http://stackoverflow.com/questions/42594682/how-to-determine-that-a-javascript-function-is-native-without-testing-native
			// see V8 issue https://bugs.chromium.org/p/v8/issues/detail?id=5773
	
			var val = Reflect.get(mod._exports, property);

			if ( typeof(val) === 'function' && !('prototype' in val) ) { // native function has prototype === undefined

				// needed for native function, like Promise.resolve().then, ...

				return boundCachedSym in val ? val[boundCachedSym] : val[boundCachedSym] = bindSetProto(val, mod._exports);
			}

			return val;
		},
		
		set: function(target, property, value) {
			
			mod._exports === invalid && reload(mod);
			return Reflect.set(mod._exports, property, value);
		},
		
		deleteProperty: function(target, property) {
			
			mod._exports === invalid && reload(mod);
			return Reflect.deleteProperty(mod._exports, property);
		},
		
		ownKeys: function(target) {
			
			mod._exports === invalid && reload(mod);
			// see https://tc39.github.io/ecma262/#sec-invariants-of-the-essential-internal-methods
			var ownKeys = Reflect.ownKeys(mod._exports);
			if ( typeof mod._exports !== 'function' )
				ownKeys.push('prototype');
			return ownKeys;
		},
		
		apply: function(target, thisArg, argumentsList) {
			
			mod._exports === invalid && reload(mod);
			return Reflect.apply(mod._exports, thisArg, argumentsList);
		},
		
		construct: function(target, argumentsList, newTarget) {
			
			mod._exports === invalid && reload(mod);
			return Reflect.construct(mod._exports, argumentsList, newTarget);
		}
	});
}

Object.defineProperty(Module.prototype, 'invalidable', {
	get: function() {
		
		return !!this._proxy;
	},
	set: function(value) {
		
		if ( this._proxy ) {
			
			if ( !value )
				this._proxy = null;
		} else {
			
			if ( value )
				this._proxy = createProxy(this);
		}
	}
});


Object.defineProperty(Module.prototype, 'exports', {
	get: function() {

		return this._proxy ? this._proxy : this._exports;
	},
	set: function(value) {

		this._exports = value;
	}
});

Module.prototype.unload = function() {

	var exports = this._exports;
	this.invalidate();
	this._exports = exports;
	this.invalidable = false;

	delete Module._cache[this.filename];
	
	// remove this module from all module children
	for ( var filename in Module._cache ) {
		 
		var children = Module._cache[filename].children;
		var pos = children.indexOf(this);
		if ( pos !== -1 )
			children.splice(pos);
	}

	this.parent = null;

	this.children.length = 0;
	
	// remove module from Module._pathCache
	var pathCache = Module._pathCache;
	var keys = Object.keys(pathCache);
	for ( var i = 0; i < keys.length; ++i )
		if ( pathCache[keys[i]] === this.filename )
			delete pathCache[keys[i]];
}

Module.prototype.unloadByPath = function(path) {

	Module._cache[Module._resolveFilename(path, this, this.parent === null)].unload();
}

Module.unloadByExports = function(exports) {
	
	for ( var filename in Module._cache )
		if ( Module._cache[filename].exports === exports )
			Module._cache[filename].unload();
}
