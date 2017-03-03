var assert = require('assert');
var utils = require('./utils.js');

require('../index.js');

describe('invalidable', function() {


	it('module non-invalidable', function() {
		
		var mod = utils.getTmpModule(`
			var count = 0;
			exports.count = function() { return count++; }
		`);
		
		assert.equal(mod.exports.count(), 0);
		module.invalidateByPath(mod.filename);
		assert.equal(mod.exports.count(), 1);
	});

		
	it('module invalidable from outside', function() {
		
		var mod = utils.getTmpModule(`
			var count = 0;
			exports.count = function() { return count++; }
		`);
		
		assert.equal(mod.exports.count(), 0);
		mod.invalidable = true;
		module.invalidateByPath(mod.filename);
		assert.equal(mod.exports.count(), 0);
	});
	
	
	it('module invalidable from inside before exports', function() {
		
		var mod = utils.getTmpModule(`
			module.invalidable = true;
			var count = 0;
			exports.count = function() { return count++; }
		`);
		
		assert.equal(mod.exports.count(), 0);
		module.invalidateByPath(mod.filename);
		assert.equal(mod.exports.count(), 0);
	});


	it('module invalidable from inside after exports', function() {
		
		var mod = utils.getTmpModule(`
			var count = 0;
			exports.count = function() { return count++; }
			module.invalidable = true;
		`);
		
		assert.equal(mod.exports.count(), 0);
		module.invalidateByPath(mod.filename);
		assert.equal(mod.exports.count(), 0);
	});
	
	
	it('module invalidable then non-invalidable from outside', function() {
		
		var mod = utils.getTmpModule(`
			var count = 0;
			exports.count = function() { return count++; }
		`);
		
		assert.equal(mod.exports.count(), 0);
		mod.invalidable = true;
		module.invalidateByPath(mod.filename);
		assert.equal(mod.exports.count(), 0);
		mod.invalidable = false;
		module.invalidateByPath(mod.filename);
		assert.equal(mod.exports.count(), 1);
	});

	
});
