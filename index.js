'use strict';

// see https://github.com/nodejs/node/blob/master/lib/module.js
// and https://github.com/nodejs/node/blob/master/lib/internal/module.js
const Module = module.constructor;

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
	
	if ( '_invalidateCallbacks' in this ) {

		this._invalidateCallbacks.forEach(callback => callback(this._exports));
		this._invalidateCallbacks.clear();
	}
	
	this._exports = null;
}

Module.prototype.onInvalidate = function(callback) {
	
	var invalidateCallbacks = this._invalidateCallbacks || (this._invalidateCallbacks = new Set);
	return invalidateCallbacks.add(callback).delete.bind(invalidateCallbacks, callback);
}

function reload(mod) {

	mod._exports = {}; // resets _exports
	mod.loaded = false;
	mod.load(mod.filename);
}

const boundCached = Symbol();

function createProxy(mod) {

	return new Proxy(function() {}, {

		getPrototypeOf: function(target) {
			
			mod._exports === null && reload(mod);
			return Reflect.getPrototypeOf(mod._exports);
		},
		
		setPrototypeOf: function(target, prototype) {
			
			mod._exports === null && reload(mod);
			return Reflect.setPrototypeOf(mod._exports, prototype);
		},
		
		isExtensible: function(target) {
			
			mod._exports === null && reload(mod);
			return Reflect.isExtensible(mod._exports);
		},
		
		preventExtensions: function(target) {
			
			mod._exports === null && reload(mod);
			return Reflect.preventExtensions(mod._exports);
		},
		
		getOwnPropertyDescriptor: function(target, prop) {
			
			mod._exports === null && reload(mod);

			if ( prop === 'prototype' && typeof(mod._exports) !== 'function' ) // see ownKeys
				return {};
			return Reflect.getOwnPropertyDescriptor(mod._exports, prop);
		},
		
		defineProperty: function(target, property, descriptor) {
			
			mod._exports === null && reload(mod);
			return Reflect.defineProperty(mod._exports, property, descriptor);
		},
		
		has: function(target, prop) {
			
			mod._exports === null && reload(mod);
			return Reflect.has(mod._exports, prop);
		},
		
		get: function(target, property, receiver) {
			
			mod._exports === null && reload(mod);
			
			// see http://stackoverflow.com/questions/42496414/illegal-invocation-error-using-es6-proxy-and-node-js
			// see https://github.com/nodejs/node/issues/11629 (Illegal invocation error using ES6 Proxy and node.js)
			// see http://stackoverflow.com/questions/42594682/how-to-determine-that-a-javascript-function-is-native-without-testing-native
			
			//return Reflect.get(mod._exports, property, receiver); // fails with native functions
	
			var val = Reflect.get(mod._exports, property);
		
			if ( typeof(val) === 'function' ) { // TBD: bind native functions only

				// needed for native function, like Promise.resolve().then, ...
				if ( boundCached in val )
					return val[boundCached];
				var bound = val.bind(mod._exports);
				Object.setPrototypeOf(bound, val); // see test "exports property on function"
				val[boundCached] = bound;
				return bound;
			}

			return val;
		},
		
		set: function(target, property, value, receiver) {
			
			mod._exports === null && reload(mod);
			return Reflect.set(mod._exports, property, value);
		},
		
		deleteProperty: function(target, property) {
			
			mod._exports === null && reload(mod);
			return Reflect.deleteProperty(mod._exports, property);
		},
		
		ownKeys: function(target) {
			
			mod._exports === null && reload(mod);
			// see https://tc39.github.io/ecma262/#sec-invariants-of-the-essential-internal-methods
			var ownKeys = Reflect.ownKeys(mod._exports);
			if ( typeof mod._exports !== 'function' )
				ownKeys.push('prototype');
			return ownKeys;
		},
		
		apply: function(target, thisArg, argumentsList) {
			
			mod._exports === null && reload(mod);
			return Reflect.apply(mod._exports, thisArg, argumentsList);
		},
		
		construct: function(target, argumentsList, newTarget) {
			
			mod._exports === null && reload(mod);
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
