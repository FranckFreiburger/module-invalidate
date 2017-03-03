var assert = require('assert');
var utils = require('./utils.js');

require('../index.js');

describe('exports', function() {

	
	it('non-invalidable exports type', function() {
		
		var mod = utils.getTmpModule(`
			module.exports = {}
		`);
		assert.equal(typeof mod.exports, 'object');
	});


	it('invalidable exports type', function() {
		
		var mod = utils.getTmpModule(`
			module.invalidable = true;
			module.exports = {}
		`);
		assert.equal(typeof mod.exports, 'function');
	});


	it('exports type Object', function() {
		
		var mod = utils.getTmpModule(`
			module.invalidable = true;
			module.exports = {
				foo: 'bar'
			}
		`);
		assert.equal(mod.exports.foo, 'bar');
	});


	it('exports type Function', function() {
		
		var mod = utils.getTmpModule(`
			module.invalidable = true;
			module.exports = function() { return 'foo' }
		`);
		assert.equal(mod.exports(), 'foo');
	});
	
	
	it('exports type Array', function() {
		
		var mod = utils.getTmpModule(`
			module.invalidable = true;
			module.exports = [1,2,3];
		`);
		assert.equal(mod.exports[1], 2);
		assert.equal(mod.exports.length, 3);
		assert.equal(typeof mod.exports.map, 'function');
	});


	it('exports type primitive', function() {
		
		var mod = utils.getTmpModule(`
			module.invalidable = true;
			module.exports = 'foo';
		`);
		
		assert.throws(function() { mod.exports.length }, /TypeError/);
	});


	it('exports ownKeys', function() {
		
		var mod = utils.getTmpModule(`
			module.invalidable = true;
			module.exports = { a:1, b:2 };
		`);
		
		assert.throws(function() { for ( var i in mod.exports ); }, /TypeError/);
	});

	it('exports for-of', function() {
		
		var mod = utils.getTmpModule(`
			module.invalidable = true;
			module.exports = [1,2,3];
		`);
		
		var val = 0;
		for ( var v of mod.exports )
			val += v;
		
		//assert.equal(mod.exports, 6);
		assert.throws(function() { for ( var i in mod.exports ); }, /TypeError/);
		
	});

	
});
