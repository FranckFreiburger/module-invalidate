const fs = require('fs');
const path = require('path');

const Module = module.constructor;

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
