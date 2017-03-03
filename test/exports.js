var assert = require('assert');
var utils = require('./utils.js');

require('../index.js');

describe('exports', function() {

	
	it('non-invalidable exports type', function() {
		
		var mod = new utils.TmpModule(`
			module.exports = {}
		`);
		assert.equal(typeof mod.module.exports, 'object');
	});


	it('invalidable exports type', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = {}
		`);
		assert.equal(typeof mod.module.exports, 'function');
	});


	it('exports type Object', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = {
				foo: 'bar'
			}
		`);
		assert.equal(mod.module.exports.foo, 'bar');
	});


	it('exports type Function', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = function() { return 'foo' }
		`);
		assert.equal(mod.module.exports(), 'foo');
	});
	
	
	it('exports type Array', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = [1,2,3];
		`);
		assert.equal(mod.module.exports[1], 2);
		assert.equal(mod.module.exports.length, 3);
		assert.equal(typeof mod.module.exports.map, 'function');
	});


	it('exports type primitive', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = 'foo';
		`);
		
		assert.throws(function() { mod.module.exports.length }, /TypeError/);
	});


	it('exports ownKeys', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = { a:1, b:2 };
		`);
		
		assert.throws(function() { for ( var i in mod.module.exports ); }, /TypeError/);
	});

	it('exports for-of', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = [1,2,3];
		`);
		
		var val = 0;
		for ( var v of mod.module.exports )
			val += v;
		
		//assert.equal(mod.module.exports, 6);
		assert.throws(function() { for ( var i in mod.module.exports ); }, /TypeError/);
		
	});

	
});
