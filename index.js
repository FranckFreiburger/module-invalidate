'use strict';

const Module = module.constructor;

const invalidateCallbacksSym = Symbol();
const validateCallbacksSym = Symbol();
const invalidated = Symbol();


Module.invalidate = function() {
	
	for ( var filename in Module._cache )
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
	
	this._exports = invalidated;
}

Module.prototype.onInvalidate = function(callback) {
	
	var invalidateCallbacks = this[invalidateCallbacksSym] || (this[invalidateCallbacksSym] = new Set);
	return invalidateCallbacks.add(callback).delete.bind(invalidateCallbacks, callback);
}

function reload(mod) {

	mod._exports = {};
	mod.loaded = false;
	mod.load(mod.filename);
	
	if ( validateCallbacksSym in mod ) {
		
		mod[validateCallbacksSym].forEach(callback => callback(mod._exports));
		mod[validateCallbacksSym].clear();
	}
}


Object.defineProperty(Module.prototype, 'invalidable', {
	value: false,
	writable: true
});

Object.defineProperty(Module.prototype, 'exports', {
	get: function() {
		
		this._exports === invalidated && reload(this);
		return this._exports;
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
