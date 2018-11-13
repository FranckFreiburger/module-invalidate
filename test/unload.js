var assert = require('assert');
var utils = require('./utils.js');

require('../index.js');

describe('unload', function() {

	it('unload no reload', function() {

		var mod = new utils.TmpModule(_ => `
			module.invalidable = true;
			exports.foo = 1;
			module.onInvalidate(function() {

				module.exports.foo;
			});
		`);

		assert.equal(mod.module.exports.foo, 1);

		mod.module.unload();

		assert.equal(mod.module, null);
	});


	it('access unloaded', function() {

		var foo = 1;
		var mod = new utils.TmpModule(_ => `
			module.invalidable = true;
			exports.foo = ${foo};
		`);

		var ref = mod.module.exports;

		assert.equal(ref.foo, 1);

		mod.module.unload();

		foo++;
		mod.set(undefined, { autoLoad: false });

		assert.equal(ref.foo, 1);
	});

});
