var assert = require('assert');
var utils = require('./utils.js');

require('../index.js');

describe('API basic tests', function() {

	it('basic', function() {
		
		assert.strictEqual(require('module'), module.constructor);
		assert.equal(typeof module.constructor._cache, 'object');
		assert.equal(typeof module.constructor._pathCache, 'object');
	});


	it('module.invalidateByPath()', function() {
		
		var foo = 1;
		var mod = new utils.TmpModule().set(_ => `
			module.invalidable = true;
			module.exports = {
				foo: ${foo}
			}
		`);
		
		assert.equal(mod.module.exports.foo, 1);
		foo++;
		mod.set();
		assert.equal(mod.module.exports.foo, 1);
		module.invalidateByPath(mod.module.filename);
		assert.equal(mod.module.exports.foo, 2);
	});
	
	
	it('Module.invalidateByExports()', function() {
		
		var foo = 1;
		
		var mod = new utils.TmpModule().set(_ =>`
			module.invalidable = true;
			module.exports = {
				foo: ${foo}
			}
		`);
		
		assert.equal(mod.module.exports.foo, 1);
		foo++;
		mod.set();
		mod.module.constructor.invalidateByExports(mod.module.exports);
		assert.equal(mod.module.exports.foo, 2);
	});


	it('module.invalidate()', function() {
		
		var foo = 1;
		
		var mod = new utils.TmpModule(_ =>`
			module.invalidable = true;
			module.exports = {
				foo: ${foo}
			}
		`);
		
		assert.equal(mod.module.exports.foo, 1);
		foo++;
		mod.set();
		mod.module.invalidate();
		assert.equal(mod.module.exports.foo, 2);
	});


	it('exports access level', function() {
		
		var count = 1;
		
		var mod = new utils.TmpModule(_ =>`
			module.invalidable = true;
			module.exports = {
				a: {
					b: {
						c: ${count}
					}
				}
			}
		`);

		var b = mod.module.exports.a.b;
		
		assert.equal(mod.module.exports.a.b.c, 1);
		assert.equal(b.c, 1);
		
		count++;
		mod.set();
		mod.module.invalidate();

		assert.equal(mod.module.exports.a.b.c, 2);
		assert.equal(b.c, 1);
	});

	
	it('selective reload', function() {

		var mB = new utils.TmpModule(_ =>`
			module.invalidable = true;
			var val = 0;
			module.exports = function() {

				return (val++);
			}
		`);

		var mA = new utils.TmpModule(_ =>`
			module.invalidable = true;
			const m = require(${utils.quoteString(mB.filename)});
			var val = 0;
			module.exports = function() {

				return (val++)+','+m();
			}
		`);
		
		assert.equal(mA.module.exports(), '0,0');
		assert.equal(mA.module.exports(), '1,1');
		mA.module.invalidate();
		assert.equal(mA.module.exports(), '0,2');
		assert.equal(mA.module.exports(), '1,3');
		mB.module.invalidate();
		assert.equal(mA.module.exports(), '2,0');
		assert.equal(mA.module.exports(), '3,1');
	});
	

	it('selective reload nested', function() {
		
		global.report = '';
		
		var mC = new utils.TmpModule(_ =>`
			global.report += 'c';
			module.invalidable = true;
		`, { autoLoad: false });
		
		var mB = new utils.TmpModule(_ =>`
			global.report += 'b';
			module.invalidable = true;
			require(${utils.quoteString(mC.filename)});
		`, { autoLoad: false });

		var mA = new utils.TmpModule(_ =>`
			global.report += 'a';
			module.invalidable = true;
			require(${utils.quoteString(mB.filename)});
		`);
		
		mA.load();
		
		assert.equal(global.report, 'abc');
		
		mB.module.invalidate();
		
		mA.module.exports.foobar;
		mB.module.exports.foobar;
		mC.module.exports.foobar;
		
		assert.equal(global.report, 'abcb');
		
		delete global.report;
		
	});
	
	
	it('invalidateByExports unique', function() {
		
		global.report = '';
		
		var mB = new utils.TmpModule(_ =>`
			global.report += 'b';
			module.invalidable = true;
			module.exports = { foo: 'bar' };
		`, { autoLoad: false });

		var mA = new utils.TmpModule(_ =>`
			global.report += 'a';
			module.invalidable = true;
			module.exports = require(${utils.quoteString(mB.filename)});
		`);
		
		mA.load();
		
		assert.equal(global.report, 'ab');
		
		module.constructor.invalidateByExports(mA.module.exports);
		mA.module.exports.foo;
		mB.module.exports.foo;
		
		assert.equal(global.report, 'aba');

		module.constructor.invalidateByExports(mB.module.exports);
		mA.module.exports.foo;
		mB.module.exports.foo;
		
		assert.equal(global.report, 'abab');

		delete global.report;
		
	});

	

});
