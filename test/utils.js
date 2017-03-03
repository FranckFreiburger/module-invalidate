const fs = require('fs');
const path = require('path');

const Module = module.constructor;

process.setMaxListeners(Infinity);

process.on('uncaughtException', function(err) {
	
	console.log(err);
});

exports.createTmpModule = function(moduleContent) {
	
	if ( !('moduleIndex' in arguments.callee) )
		arguments.callee.moduleIndex = 0;
	
	arguments.callee.moduleIndex++;
	
	var moduleFilename = path.join(__dirname, `_tmp_module${arguments.callee.moduleIndex}.js`);
	
	fs.writeFileSync(moduleFilename, moduleContent);
	
	this.filename = function() {
		
		return moduleFilename;
	}
	
	function onEnd(err) {
		
		if ( !moduleFilename )
			return;
		
		fs.unlinkSync(moduleFilename);
		moduleFilename = undefined;
	}

	process.on('exit', onEnd);
	process.on('SIGINT', onEnd);
	process.on('uncaughtException', onEnd);
	
	return moduleFilename;
}

exports.getTmpModule = function(moduleContent) {
	
	var exports = require(this.createTmpModule(moduleContent));

	for ( var filename in Module._cache )
		if ( Module._cache[filename].exports === exports )
			return Module._cache[filename];
}

// ---

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


exports.TmpModule = function() {
	
	moduleIndex++;
	var moduleFilename = path.join(__dirname, `_tmp_mod${moduleIndex}.js`);
	
	this.module = null;
	this.moduleContentFct = null;
	
	this.set = function(moduleContent) {

		if ( typeof moduleContent === 'function' )
			this.moduleContentFct = moduleContent;
		else
		if ( typeof moduleContent === 'string' )
			this.moduleContentFct = function() { return moduleContent }
			
		moduleContent = this.moduleContentFct();
		
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
}
	
	

