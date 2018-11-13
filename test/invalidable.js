var assert = require('assert');
var utils = require('./utils.js');

require('../index.js');

describe('invalidable', function() {


	it('module non-invalidable', function() {

		var mod = new utils.TmpModule(`
			var count = 0;
			exports.count = function() { return count++; }
		`);

		var exports = mod.module.exports;

		assert.equal(exports.count(), 0);
		module.invalidateByPath(mod.module.filename);
		assert.equal(exports.count(), 1);
	});


	it('module invalidable from outside', function() {

		var mod = new utils.TmpModule(`
			var count = 0;
			exports.count = function() { return count++; }
		`);

		mod.module.invalidable = true;

		var exports = mod.module.exports;

		module.invalidateByPath(mod.module.filename);
		assert.equal(exports.count(), 0);
	});


	it('module invalidable from inside before exports', function() {

		var mod = new utils.TmpModule(`
			module.invalidable = true;
			var count = 0;
			exports.count = function() { return count++; }
		`);

		var exports = mod.module.exports;

		assert.equal(exports.count(), 0);
		module.invalidateByPath(mod.module.filename);
		assert.equal(exports.count(), 0);
	});


	it('module invalidable from inside after exports', function() {

		var mod = new utils.TmpModule(`
			var count = 0;
			exports.count = function() { return count++; }
			module.invalidable = true;
		`);

		var exports = mod.module.exports;

		assert.equal(exports.count(), 0);
		module.invalidateByPath(mod.module.filename);
		assert.equal(exports.count(), 0);
	});


	it('module invalidable then non-invalidable then invalidable from outside', function() {

		var mod = new utils.TmpModule(`
			var count = 0;
			exports.count = function() { return count++; }
		`);


		mod.module.invalidable = true;
		var exports = mod.module.exports;
		module.invalidateByPath(mod.module.filename);
		assert.equal(exports.count(), 0);
		mod.module.invalidable = false;
		module.invalidateByPath(mod.module.filename);
		assert.equal(exports.count(), 1);
		mod.module.invalidable = true;
		module.invalidateByPath(mod.module.filename);
		assert.equal(exports.count(), 0);
	});


	it('module invalidable after export', function() {

		var mod = new utils.TmpModule(`
			var count = 0;
			exports.count = function() { return count++; }
		`);

		var exports = mod.module.exports;

		mod.module.invalidable = true;

		assert.equal(exports.count(), 0);

		mod.module.invalidate();

		assert.equal(exports.count(), 1);

		exports = mod.module.exports;

		assert.equal(exports.count(), 0);
	});


});
