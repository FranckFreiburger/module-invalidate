const fs = require('fs');
const path = require('path');

const Module = module.constructor;

var moduleIndex = 0;
var tmpFileList = new Set();

function onEnd(...args) {
	
	if ( args.length > 0 )
		console.log(...args)
	
	tmpFileList.forEach(filename => fs.unlinkSync(filename));
	tmpFileList.clear();
}

process.on('exit', onEnd);
process.on('SIGINT', onEnd);
process.on('uncaughtException', onEnd);


exports.TmpModule = function(moduleContent, opts) {
	
	moduleIndex++;
	var moduleContentFct = null;

	this.filename = path.join(__dirname, `_tmp_mod${moduleIndex}.js`);
	
	Object.defineProperty(this, 'module', {
		
		get: () => {
			
			for ( var filename in Module._cache )
				if ( filename === this.filename )
					return Module._cache[filename];
			return null;
		}
	})
	
	this.load = function() {

		require(this.filename);
	}
	
	this.set = function(moduleContent, opts = {}) {

		if ( typeof moduleContent === 'function' )
			moduleContentFct = moduleContent;
		else
		if ( typeof moduleContent === 'string' )
			moduleContentFct = function() { return moduleContent }
			
		moduleContent = moduleContentFct();
		
		fs.writeFileSync(this.filename, moduleContent);
		tmpFileList.add(this.filename);
		
		if ( this.module === null && opts.autoLoad !== false )
			this.load();
		
		return this;
	}
	
	if ( moduleContent !== undefined )
		this.set(moduleContent, opts);
}
	
	

