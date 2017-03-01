'use strict';

// see https://github.com/nodejs/node/blob/master/lib/module.js
var Module = module.constructor;


Module.invalidate = function() {
	
	for ( var id in this._cache )
		if ( 'invalidate' in this._cache[id] )
			this._cache[id].invalidate();
		
	global.gc && global.gc();
}


Module.prototype.invalidate = function(path) {
	
	if ( path !== undefined ) {
	
		var id = Module._resolveFilename(path, this);
		Module._cache[id].invalidate();
	} else {
		
		// do not invalidate main module nor this module
		if ( this.parent === null && this === module )
			return;
		this._exports = null;
	}
}


function reload(mod) {

	// console.log('reload()');
	mod._exports = {}; // resets _exports
	mod.loaded = false;
	mod.load(mod.filename);
}


function createProxy(mod) {
	
	return new Proxy(function() {}, {

		getPrototypeOf: (target) => {
			
			mod._exports === null && reload(mod);
			return Reflect.getPrototypeOf(mod._exports);
		},
		
		setPrototypeOf: (target, prototype) => {
			
			mod._exports === null && reload(mod);
			return Reflect.setPrototypeOf(mod._exports, prototype);
		},
		
		isExtensible: (target) => {
			
			mod._exports === null && reload(mod);
			return Reflect.isExtensible(mod._exports);
		},
		
		preventExtensions: (target) => {
			
			mod._exports === null && reload(mod);
			return Reflect.preventExtensions(mod._exports);
		},
		
		getOwnPropertyDescriptor: (target, prop) => {
			
			mod._exports === null && reload(mod);
			return Reflect.getOwnPropertyDescriptor(mod._exports, prop);
		},
		
		defineProperty: (target, property, descriptor) => {
			
			// console.log('P defineProperty', property)
			
			mod._exports === null && reload(mod);
			return Reflect.defineProperty(mod._exports, property, descriptor);
		},
		
		has: (target, prop) => {
			
			mod._exports === null && reload(mod);
			return Reflect.has(mod._exports, prop);
		},
		
		get: (target, property, receiver) => {
			
			// console.log('P get', property)
			
			mod._exports === null && reload(mod);
			
			// see http://stackoverflow.com/questions/42496414/illegal-invocation-error-using-es6-proxy-and-node-js
			// see https://github.com/nodejs/node/issues/11629
			var val = Reflect.get(mod._exports, property, receiver);
			return typeof(val) === 'function' ? val.bind(mod._exports) : val;
			//return val;
		},
		
		set: (target, property, value, receiver) => {
			
			// console.log('P set', property)
			
			mod._exports === null && reload(mod);
			return Reflect.set(mod._exports, property, value, receiver);
		},
		
		deleteProperty: (target, property) => {
			
			mod._exports === null && reload(mod);
			return Reflect.deleteProperty(mod._exports, property);
		},
		
		ownKeys: (target) => {
			
			mod._exports === null && reload(mod);
			// see https://tc39.github.io/ecma262/#sec-invariants-of-the-essential-internal-methods
			throw new TypeError('ownKeys not implemented');
			//return [...Reflect.ownKeys(target), ...Reflect.ownKeys(mod._exports)];
			//return Reflect.ownKeys(mod._exports);
		},
		
		apply: (target, thisArg, argumentsList) => {
			
			// console.log('P apply');
			
			mod._exports === null && reload(mod);
			return Reflect.apply(mod._exports, thisArg, argumentsList);
		},
		
		construct: (target, argumentsList, newTarget) => {
			
			// console.log('P construct');
			
			mod._exports === null && reload(mod);
			return Reflect.construct(mod._exports, argumentsList, newTarget);
		}
	});
}

Object.defineProperty(Module.prototype, 'exports', {
	get: function() {

		// not primitive value ?
		if ( this._proxy !== null )
			return this._proxy;
		
		// invalidated ?
		if ( this._exports === null )
			reload(this);
		
		// TBD check if this._exports is still a primitive
		// return the primitive value
		return this._exports;
	},
	set: function(value) {

		this._exports = value;

		var valueType = typeof value;
		if ( valueType !== 'function' && valueType !== 'object' || valueType === null ) {
			
			this._proxy = null;
			return;
		}

		if ( !this._proxy )
			this._proxy = createProxy(this);
	}
});

/* test
Module.prototype._unload = function() {
	
	this.exports = null;
	
	// remove this module from all module children	
	for ( var path in this.cache ) {
		 
		var children = this.cache[path].children;
		var pos = children.indexOf(this);
		if ( pos != -1 )
			children.splice(pos);
	}

	// remove module from Module._cache
	delete this.constructor._cache[this.filename];
	
	this.parent = null;

	this.children.length = 0;
	
	// remove module from Module._pathCache
	var pathCache = this.constructor._pathCache;
	var keys = Object.keys(pathCache);
	for ( var i = 0; i < keys.length; ++i )
		if ( pathCache[keys[i]] == this.filename )
			delete pathCache[keys[i]];
}
*/
