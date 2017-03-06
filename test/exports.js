var assert = require('assert');
var utils = require('./utils.js');

require('../index.js');

describe('exports', function() {

	
	it('non-invalidable exports type', function() {
		
		var mod = new utils.TmpModule(`
			module.exports = {}
		`);
		
		assert.equal(typeof mod.module.exports, 'object');
		
		mod.module.invalidate();

		assert.equal(typeof mod.module.exports, 'object');
	});


	it('invalidable exports type', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = {}
		`);

		assert.equal(typeof mod.module.exports, 'function');

		mod.module.invalidate();

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

		mod.module.invalidate();

		assert.equal(mod.module.exports.foo, 'bar');
	});


	it('exports type Function', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = function() { return 'foo' }
		`);

		assert.equal(mod.module.exports(), 'foo');

		mod.module.invalidate();

		assert.equal(mod.module.exports(), 'foo');
	});


	it('exports type constructor', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = class {
				constructor() {
					
					this.value = 123;
				}
				getValue() {
					
					return this.value;
				}
			}
		`);
		assert.equal(new mod.module.exports().getValue(), 123);
		
		module.constructor.invalidateByExports(mod.module.exports);
		
		assert.equal(new mod.module.exports().getValue(), 123);
	});


	it('exports type constructor instanceof', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = class {}
		`);

		assert.equal(new mod.module.exports() instanceof mod.module.exports, true);
		
		var instance = new mod.module.exports();
		
		module.constructor.invalidateByExports(mod.module.exports);
		
		assert.equal(instance instanceof mod.module.exports, false);
		
		assert.equal(new mod.module.exports() instanceof mod.module.exports, true);
	});
	
	
	it('exports type Array', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = [1,2,3];
		`);

		assert.equal(mod.module.exports[1], 2);
		assert.equal(mod.module.exports.length, 3);
		assert.equal(typeof mod.module.exports.map, 'function');
		
		module.constructor.invalidateByExports(mod.module.exports);
		
		assert.equal(mod.module.exports[1], 2);
		assert.equal(mod.module.exports.length, 3);
		assert.equal(typeof mod.module.exports.map, 'function');
	});


	it('exports type primitive', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = 'foo';
		`);
		
		assert.equal(mod.module.exports, 'foo');
		module.constructor.invalidateByExports(mod.module.exports);
		assert.equal(mod.module.exports, 'foo');
	});


	it('exports type primitive to primitive', function() {
		
		val = '123';
		var mod = new utils.TmpModule(_ => `
			module.invalidable = true;
			module.exports = ${val};
		`);
		
		assert.equal(mod.module.exports, 123);

		val = '456';
		mod.set();
		
		mod.module.invalidate();
		
		assert.equal(mod.module.exports, 456);
	});


	it('exports type primitive to object', function() {
		
		var val = '123';
		var mod = new utils.TmpModule(_ => `
			module.invalidable = true;
			module.exports = ${val};
		`);
		
		assert.equal(mod.module.exports, 123);
		val = '{ a:"bar" }';
		mod.set();
		mod.module.invalidate();
		assert.equal(mod.module.exports.a, 'bar');
	});


	it('exports type object to primitive', function() {
		
		val = '{ a:"bar" }';
		var mod = new utils.TmpModule(_ => `
			module.invalidable = true;
			module.exports = ${val};
		`);
		
		assert.equal(mod.module.exports.a, 'bar');

		val = '456';
		mod.set();
		mod.module.invalidate();
		assert.equal(mod.module.exports, 456);
	});


	it('exports Object.keys', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = { a:1, b:2 };
		`);

		assert.equal(Object.keys(mod.module.exports).join(), 'a,b');
		mod.module.invalidate();
		assert.equal(Object.keys(mod.module.exports).join(), 'a,b');
	});


	it('exports for-in', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = { a:1, b:2 };
		`);
		
		var res = '';
		for ( var prop in mod.module.exports )
			res += prop + mod.module.exports[prop];
		assert.equal(res, 'a1b2');
		
		mod.module.invalidate();
		
		for ( var prop in mod.module.exports )
			res += prop + mod.module.exports[prop];
		assert.equal(res, 'a1b2a1b2');
		
	});


	it('exports for-of', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = [1,2,3];
		`);
		
		var val = 0;
		for ( var v of mod.module.exports )
			val += v;

		assert.equal(val, 6);
		
		mod.module.invalidate();

		for ( var v of mod.module.exports )
			val += v;

		assert.equal(val, 12);
	});


	it('exports this', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			function ctor() {
				
				this.bar = 123;
				this.foo = function() {
					
					return this.bar;
					
				}
				
			}
			module.exports = new ctor;
		`);
		
		assert.equal(mod.module.exports.constructor.name, 'ctor');
		assert.equal(mod.module.exports.foo(), 123);

		mod.module.invalidate();

		assert.equal(mod.module.exports.constructor.name, 'ctor');
		assert.equal(mod.module.exports.foo(), 123);
	});

	it('exports keep method name', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			function ctor() {
				
				this.foo = function foo() {
				}

				this.bar = function() {
				}
			}
			module.exports = new ctor;
		`);
		
		assert.equal(mod.module.exports.constructor.name, 'ctor');
		assert.equal(mod.module.exports.foo.name, 'foo');
		assert.equal(mod.module.exports.bar.name, '');

		mod.module.invalidate();

		assert.equal(mod.module.exports.constructor.name, 'ctor');
		assert.equal(mod.module.exports.foo.name, 'foo');
		assert.equal(mod.module.exports.bar.name, '');
	});
	
	
	it('exports keep function name', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			function myFct() {
			}
			module.exports = myFct;
		`);
		
		assert.equal(mod.module.exports.name, 'myFct');

		mod.module.invalidate();

		assert.equal(mod.module.exports.name, 'myFct');
	});
	
	
	it('property on function', function() {

		var mod = new utils.TmpModule(`
			module.invalidable = true;
			
			var fct = function() { return 123 };
			fct.bar = 456;
			module.exports.foo = fct
		`);
		
		assert.equal(typeof mod.module.exports.foo, 'function');
		assert.equal(mod.module.exports.foo(), 123);
		assert.equal(mod.module.exports.foo.bar, 456);
		
		mod.module.invalidate();

		assert.equal(typeof mod.module.exports.foo, 'function');
		assert.equal(mod.module.exports.foo(), 123);
		assert.equal(mod.module.exports.foo.bar, 456);
	});
	
	
	it('property on function through the proxy (v1)', function() {

		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports.foo = function() { return 123 };
			module.exports.foo.bar = 456;
		`);
		
		assert.equal(typeof mod.module.exports.foo, 'function');
		assert.equal(mod.module.exports.foo(), 123);
		assert.equal(mod.module.exports.foo.bar, 456);
		
		mod.module.invalidate();

		assert.equal(typeof mod.module.exports.foo, 'function');
		assert.equal(mod.module.exports.foo(), 123);
		assert.equal(mod.module.exports.foo.bar, 456);
	});
	
	
	it('property on function through the proxy (v2)', function() {

		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports.foo = function() { return 123 };
			module.exports.foo.bar = 456;
		`);
		
		assert.equal(typeof mod.module.exports.foo, 'function');
		assert.equal(mod.module.exports.foo.bar, 456);
		assert.equal(mod.module.exports.foo(), 123);
		
		mod.module.invalidate();

		assert.equal(typeof mod.module.exports.foo, 'function');
		assert.equal(mod.module.exports.foo.bar, 456);
		assert.equal(mod.module.exports.foo(), 123);
	});
	
	
	it('exports json object', function() {
		
		var val = 1;
		
		var mod = new utils.TmpModule(_ =>`{ "a":${val} }`, { ext: 'json' });
		
		mod.module.invalidable = true;
		
		assert.equal(mod.module.exports.a, 1);
		
		val++;
		mod.set();
		mod.module.invalidate();

		assert.equal(mod.module.exports.a, 2);
	});


	it('exports json primitive to primitive', function() {
		
		var val = 1;
		
		var mod = new utils.TmpModule(_ =>`${val}`, { ext: 'json' });
		mod.module.invalidable = true;
		
		assert.equal(mod.module.exports, 1);

		val++;
		mod.set();
		mod.module.invalidate();

		assert.equal(mod.module.exports, 2);
		
		//assert.throws(function() { mod.module.exports.toString() }, TypeError);
	});
	
	
});
