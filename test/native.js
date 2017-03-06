var assert = require('assert');
var utils = require('./utils.js');

require('../index.js');

describe('native module', function() {

	it('os.cpus without non-invalidable', function() {
		
		var mod = new utils.TmpModule(`
			module.exports = require('os');
		`);
		
		assert.equal(typeof mod.module.exports.cpus(), 'object');
		mod.module.invalidate();
		assert.equal(typeof mod.module.exports.cpus(), 'object');
	});


	// see V8 issue https://bugs.chromium.org/p/v8/issues/detail?id=5773
	xit('os.cpus', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = require('os');
		`);
		
		assert.equal(typeof mod.module.exports.cpus(), 'object');
		mod.module.invalidate();
		assert.equal(typeof mod.module.exports.cpus(), 'object');
	});
	
	xit('os.userInfo', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = require('os');
		`);
		
		assert.equal(typeof mod.module.exports.userInfo(), 'object');
		mod.module.invalidate();
		assert.equal(typeof mod.module.exports.userInfo(), 'object');
	});

	it('process.platform', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = process.platform;
		`);
		
		assert.equal(mod.module.exports, process.platform);
		mod.module.invalidate();
		assert.equal(mod.module.exports, process.platform);
	});


	it('os.cpus as exports', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = require('os').cpus;
		`);
		
		assert.equal(typeof mod.module.exports(), 'object');
		mod.module.invalidate();
		assert.equal(typeof mod.module.exports(), 'object');
	});


	it('os.type as exports', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = require('os').type;
		`);
		
		assert.equal(typeof mod.module.exports(), 'string');
		mod.module.invalidate();
		assert.equal(typeof mod.module.exports(), 'string');
	});


	it('Function::bind', function() {

		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = function() { return this.foo }.bind(module.exports);
			module.exports.foo = 123;
		`);
		
		assert.equal(typeof mod.module.exports, 'function');
		assert.equal(mod.module.exports(), 123);
		mod.module.invalidate();
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
	
	
	it('exports Math.cos to a property', function() {

		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports.cos = Math.cos;
		`);
		
		assert.equal(typeof mod.module.exports.cos, 'function');
		assert.equal(mod.module.exports.cos(0), 1);
	});


	it('exports Math.cos directly', function() {

		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = Math.cos;
		`);
		
		assert.equal(mod.module.exports(0), 1);
	});
	

});
