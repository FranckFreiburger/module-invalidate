require('../index.js');

var child = require('./test8_child.js');


setTimeout(function() {
	
	module.constructor.invalidateByExports(child);
	
	setTimeout(function() {
		
		module.constructor.invalidateByExports(child);
	}, 500);

	
}, 500);

