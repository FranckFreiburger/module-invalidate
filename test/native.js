var assert = require('assert');
var utils = require('./utils.js');

require('../index.js');

describe('native module', function() {

	it('os.cpus without non-invalidable', function() {
		
		var mod = new utils.TmpModule(`
			module.exports = require('os');
		`);
		
		assert.equal(typeof mod.module.exports.cpus(), 'object');
	});

	it('os.cpus', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = require('os');
		`);
		
		assert.equal(typeof mod.module.exports.cpus(), 'object');
	});


	it('os.cpus as exports', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = require('os').cpus;
		`);
		
		assert.equal(typeof mod.module.exports(), 'object');
	});


	it('os.type as exports', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = require('os').type;
		`);
		
		assert.equal(typeof mod.module.exports(), 'string');
	});



	it('lib ffi', function() {
		
		var ffi = require('ffi');
		var libm = new ffi.Library('msvcrt', {
			'ceil': [ 'double', [ 'double' ] ]
		});
		assert.equal(libm.ceil(1.1), 2);
	});
	

	it('Function::bind', function() {

		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = function() { return this.foo }.bind(module.exports);
			module.exports.foo = 123;
		`);
		
		assert.equal(typeof mod.module.exports, 'function');
		assert.equal(mod.module.exports(), 123);
	});


	
	it('exports Promise::then', function() {

		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = Promise.resolve(123);
		`);
		
		assert.equal(typeof mod.module.exports.then, 'function');
		
		return mod.module.exports.then(function(result) {
			
			assert.equal(result, 123);
		});
	});
	

});
