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


exports.TmpModule = function(moduleContent) {
	
	moduleIndex++;
	var moduleFilename = path.join(__dirname, `_tmp_mod${moduleIndex}.js`);

	var moduleContentFct = null;
	
	this.module = null;
	
	this.set = function(moduleContent) {

		if ( typeof moduleContent === 'function' )
			moduleContentFct = moduleContent;
		else
		if ( typeof moduleContent === 'string' )
			moduleContentFct = function() { return moduleContent }
			
		moduleContent = moduleContentFct();
		
		fs.writeFileSync(moduleFilename, moduleContent);
		tmpFileList.add(moduleFilename);
		
		if ( this.module === null ) {
		
			var exports = require(moduleFilename);

			for ( var filename in Module._cache )
				if ( Module._cache[filename].exports === exports )
					this.module = Module._cache[filename];
		}
		
		return this;
	}
	
	if ( moduleContent !== undefined )
		this.set(moduleContent);
}
	
	

