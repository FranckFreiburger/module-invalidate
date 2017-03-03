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
		
		global.report = '';
		
		var mC = new utils.TmpModule(_ =>`
			global.report += 'c';
			module.invalidable = true;
		`, { autoLoad: false });
		
		var mB = new utils.TmpModule(_ =>`
			global.report += 'b';
			module.invalidable = true;
			require(${JSON.stringify(mC.filename)});
		`, { autoLoad: false });

		var mA = new utils.TmpModule(_ =>`
			global.report += 'a';
			module.invalidable = true;
			require(${JSON.stringify(mB.filename)});
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

});
