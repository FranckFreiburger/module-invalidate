var assert = require('assert');
var utils = require('./utils.js');

require('../index.js');

describe('onInvalidate', function() {

	
	it('onInvalidate callback', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = function(callback) {
				module.onInvalidate(callback);
			}
		`);
		
		var pass = 0;
		mod.module.exports(function() {

			pass++;
		});
		
		module.invalidateByPath(mod.module.filename);
		module.invalidateByPath(mod.module.filename);

		assert.equal(pass, 1);
	});


	it('cancel onInvalidate', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			module.exports = function(callback) {
				var cancel = module.onInvalidate(callback);
				cancel();
			}
		`);
		
		var pass = 0;
		mod.module.exports(function() {

			pass++;
		});
		
		module.invalidateByPath(mod.module.filename);
		module.invalidateByPath(mod.module.filename);

		assert.equal(pass, 0);
	});


	it('onInvalidate callback immutableExports', function() {
		
		var mod = new utils.TmpModule(`
			module.invalidable = true;
			
			var report;
			module.exports = {
				setReport: function(r) {
					report = r;
				},
				foo: 123
			};
			
			module.onInvalidate(function(immutableExports) {
				
				report.invalidateCount++;
				report.immutableExports = immutableExports;
			});
		`);
		
		var report = {
			invalidateCount: 0
		};
		
		mod.module.exports.setReport(report);
		
		module.invalidateByPath(mod.module.filename);
		
		assert.equal(report.invalidateCount, 1);
		
		assert.equal(mod.module.exports.foo, 123);
		assert.equal(report.immutableExports.foo, 123);
		
		assert.notStrictEqual(module.exports, report.immutableExports);
	});
	
});
