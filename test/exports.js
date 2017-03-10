var assert = require('assert');
var utils = require('./utils.js');

require('../index.js');

describe('exports', function() {

	
	it('non-invalidable exports object type', function() {
		
		var mod = new utils.TmpModule(`
			module.exports = {}
		`);
		
		var exports = mod.module.exports;
		
		assert.equal(typeof exports, 'object');
		
		mod.module.invalidate();

		assert.equal(typeof exports, 'object');
	});


	it('non-invalidable exports function type', function() {
		
		var mod = new utils.TmpModule(`
			module.exports = function(){}
		`);
		
		var exports = mod.module.exports;

		assert.equal(typeof exports, 'function');
		
		mod.module.invalidate();

		assert.equal(typeof exports, 'function');
	});


	it('invalidable exports type', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = {}
		`);

		var exports = mod.module.exports;

		assert.equal(typeof exports, 'function');

		mod.module.invalidate();

		assert.equal(typeof exports, 'function');
	});


	it('exports type Object', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = {
				foo: 'bar'
			}
		`);
		
		var exports = mod.module.exports;

		assert.equal(exports.foo, 'bar');

		mod.module.invalidate();

		assert.equal(exports.foo, 'bar');
	});


	it('exports type Date', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = new Date();
		`);
		
		var exports = mod.module.exports;

		assert.strictEqual(exports.constructor, Date);
		assert.equal(!isNaN(new Date(exports).getTime()), true);

		mod.module.invalidate();

		assert.strictEqual(exports.constructor, Date);
		assert.equal(!isNaN(new Date(exports).getTime()), true);
	});


	it('exports type Function', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = function() { return 'foo' }
		`);

		var exports = mod.module.exports;

		assert.equal(exports(), 'foo');

		mod.module.invalidate();

		assert.equal(exports(), 'foo');
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
		
		var exports = mod.module.exports;

		assert.equal(new exports().getValue(), 123);
		
		module.constructor.invalidateByExports(exports);
		
		assert.equal(new exports().getValue(), 123);
	});


	it('exports type constructor instanceof', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = class {}
		`);

		var exports = mod.module.exports;

		assert.equal(new exports() instanceof exports, true);
		
		var instance = new exports();
		
		module.constructor.invalidateByExports(exports);
		
		assert.equal(instance instanceof exports, false);
		
		assert.equal(new exports() instanceof exports, true);
	});
	
	
	it('exports type Array', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = [1,2,3];
		`);

		var exports = mod.module.exports;

		assert.equal(exports[1], 2);
		assert.equal(exports.length, 3);
		assert.equal(typeof exports.map, 'function');
		
		module.constructor.invalidateByExports(exports);
		
		assert.equal(exports[1], 2);
		assert.equal(exports.length, 3);
		assert.equal(typeof exports.map, 'function');
	});



	it('exports type string primitive', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = 'foo';
		`);
		
		var exports = mod.module.exports;

		assert.equal(exports, 'foo');
		module.constructor.invalidateByExports(exports);
		assert.equal(exports, 'foo');
	});


	it('exports type boolean primitive', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = true;
		`);
		
		var exports = mod.module.exports;

		assert.equal(exports, true);
		module.constructor.invalidateByExports(exports);
		assert.equal(exports, true);
	});


	it('exports type null-prototype object', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = Object.create(null);
			module.exports.foo = 123;
		`);
		
		var exports = mod.module.exports;

		assert.equal(Object.getPrototypeOf(exports), null);
		assert.equal(exports.foo, 123);
		mod.module.invalidate();
		assert.equal(Object.getPrototypeOf(exports), null);
		assert.equal(exports.foo, 123);
	});


	xit('exports type void(0) primitive', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = void(0);
		`);
		
		var exports = mod.module.exports;

		assert.equal(exports, void(0));
		module.constructor.invalidateByExports(exports);
		assert.equal(exports, void(0));
	});

	
	xit('exports type null', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = null;
		`);
		
		var exports = mod.module.exports;

		assert.equal(exports === null, true);
		module.constructor.invalidateByExports(exports);
		assert.equal(exports === null, true);
	});


	it('exports type primitive to primitive', function() {
		
		val = '123';
		var mod = new utils.TmpModule(_ => `
			module.invalidable = true;
			module.exports = ${val};
		`);
		
		var exports = mod.module.exports;

		assert.equal(exports, 123);

		val = '456';
		mod.set();
		
		mod.module.invalidate();
		
		assert.equal(exports, 456);
	});


	it('exports type primitive to object', function() {
		
		var val = '123';
		var mod = new utils.TmpModule(_ => `
			module.invalidable = true;
			module.exports = ${val};
		`);
		
		var exports = mod.module.exports;

		assert.equal(exports, 123);
		val = '{ a:"bar" }';
		mod.set();
		mod.module.invalidate();
		assert.equal(exports.a, 'bar');
	});


	it('exports type object to primitive', function() {
		
		val = '{ a:"bar" }';
		var mod = new utils.TmpModule(_ => `
			module.invalidable = true;
			module.exports = ${val};
		`);
		
		var exports = mod.module.exports;

		assert.equal(exports.a, 'bar');

		val = '456';
		mod.set();
		mod.module.invalidate();
		assert.equal(exports, 456);
	});


	it('exports Object.keys', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = { a:1, b:2 };
		`);

		var exports = mod.module.exports;

		assert.equal(Object.keys(exports).join(), 'a,b');
		mod.module.invalidate();
		assert.equal(Object.keys(exports).join(), 'a,b');
	});


	it('exports for-in', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = { a:1, b:2 };
		`);
		
		var exports = mod.module.exports;

		var res = '';
		for ( var prop in exports )
			res += prop + exports[prop];
		assert.equal(res, 'a1b2');
		
		mod.module.invalidate();
		
		for ( var prop in exports )
			res += prop + exports[prop];
		assert.equal(res, 'a1b2a1b2');
		
	});


	it('exports for-of', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = [1,2,3];
		`);
		
		var exports = mod.module.exports;
		
		var val = 0;
		for ( var v of exports )
			val += v;

		assert.equal(val, 6);
		
		mod.module.invalidate();

		for ( var v of exports )
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
		
		var exports = mod.module.exports;
		
		assert.equal(exports.constructor.name, 'ctor');
		assert.equal(exports.foo(), 123);

		mod.module.invalidate();

		assert.equal(exports.constructor.name, 'ctor');
		assert.equal(exports.foo(), 123);
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

		var exports = mod.module.exports;
		
		assert.equal(exports.constructor.name, 'ctor');
		assert.equal(exports.foo.name, 'foo');
		assert.equal(exports.bar.name, '');

		mod.module.invalidate();

		assert.equal(exports.constructor.name, 'ctor');
		assert.equal(exports.foo.name, 'foo');
		assert.equal(exports.bar.name, '');
	});
	
	
	it('exports keep function name', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			function myFct() {
			}
			module.exports = myFct;
		`);

		var exports = mod.module.exports;
		
		assert.equal(exports.name, 'myFct');

		mod.module.invalidate();

		assert.equal(exports.name, 'myFct');
	});
	
	
	it('property on function', function() {

		var mod = new utils.TmpModule(`
			module.invalidable = true;
			
			var fct = function() { return 123 };
			fct.bar = 456;
			module.exports.foo = fct
		`);

		var exports = mod.module.exports;
		
		assert.equal(typeof exports.foo, 'function');
		assert.equal(exports.foo(), 123);
		assert.equal(exports.foo.bar, 456);
		
		mod.module.invalidate();

		assert.equal(typeof exports.foo, 'function');
		assert.equal(exports.foo(), 123);
		assert.equal(exports.foo.bar, 456);
	});


	it('changing property on function from the module', function() {

		var mod = new utils.TmpModule(`
			module.invalidable = true;
			
			var fct = function() {};
			fct.bar = 456;
			module.exports = {
				foo: fct,
				change: function() {
					
					fct.bar = 789;
				}
			}
		`);

		var exports = mod.module.exports;
		
		assert.equal(exports.foo.bar, 456);
		mod.module.invalidate();
		assert.equal(exports.foo.bar, 456);
		exports.change();
		assert.equal(exports.foo.bar, 789);
	});


	it('changing property on function from the outside', function() {

		var mod = new utils.TmpModule(`
			module.invalidable = true;
			
			var fct = function() {};
			fct.bar = 456;
			module.exports = {
				foo: fct,
				check: function() {
					
					return fct.bar;
				}
			}
		`);
		
		var exports = mod.module.exports;

		assert.equal(exports.foo.bar, 456);
		mod.module.invalidate();
		assert.equal(exports.foo.bar, 456);
		exports.foo.bar = 789;

		assert.equal(exports.check(), 789);
	});

	
	it('property on function through the proxy (v1)', function() {

		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports.foo = function() { return 123 };
			module.exports.foo.bar = 456;
		`);
		
		var exports = mod.module.exports;
		
		assert.equal(typeof exports.foo, 'function');
		assert.equal(exports.foo(), 123);
		assert.equal(exports.foo.bar, 456);
		
		mod.module.invalidate();

		assert.equal(typeof exports.foo, 'function');
		assert.equal(exports.foo(), 123);
		assert.equal(exports.foo.bar, 456);
	});
	
	
	it('property on function through the proxy (v2)', function() {

		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports.foo = function() { return 123 };
			module.exports.foo.bar = 456;
		`);
		
		var exports = mod.module.exports;
		
		assert.equal(typeof exports.foo, 'function');
		assert.equal(exports.foo.bar, 456);
		assert.equal(exports.foo(), 123);
		
		mod.module.invalidate();

		assert.equal(typeof exports.foo, 'function');
		assert.equal(exports.foo.bar, 456);
		assert.equal(exports.foo(), 123);
	});
	
	
	it('exports json object', function() {
		
		var val = 1;
		
		var mod = new utils.TmpModule(_ =>`{ "a":${val} }`, { ext: 'json' });
		
		mod.module.invalidable = true;
		
		var exports = mod.module.exports;
		
		assert.equal(exports.a, 1);
		
		val++;
		mod.set();
		mod.module.invalidate();

		assert.equal(exports.a, 2);
	});


	it('exports json primitive to primitive', function() {
		
		var val = 1;
		
		var mod = new utils.TmpModule(_ =>`${val}`, { ext: 'json' });
		mod.module.invalidable = true;
		
		var exports = mod.module.exports;
		
		assert.equal(exports, 1);

		val = '"foo"';
		mod.set();
		mod.module.invalidate();

		assert.equal(exports, 'foo');
	});
	
	it('defined toString()', function() {

		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = {
				toString: function() {
					
					return '123';
				}
			}
		`);

		var exports = mod.module.exports;
		
		assert.equal(''+exports, '123');
		assert.equal(+exports, 123);
		
		mod.module.invalidate();

		assert.equal(''+exports, '123');
		assert.equal(+exports, 123);
	});
	

	it('defined valueOf()', function() {

		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = {
				valueOf: function() {
					
					return 123;
				}
			}
		`);

		var exports = mod.module.exports;
		
		assert.equal(+exports, 123);
		
		mod.module.invalidate();

		assert.equal(+exports, 123);
	});


});
