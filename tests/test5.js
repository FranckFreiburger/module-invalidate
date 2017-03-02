require('../index.js');

const fs = require('fs');

var test5_module = require('./test5_module.js');


fs.watch(require.resolve('./test5_module.js'), function() {
	
	module.invalidateByPath('./test5_module.js');
});


setInterval(function() {
	
	console.log(test5_module.count());
}, 1000);