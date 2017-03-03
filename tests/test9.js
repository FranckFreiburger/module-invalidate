require('../index.js');

var child = require('./test9_child.js');
console.log(child.foo)

setTimeout(function() {

	module.unloadByPath('./test9_child.js');
	
	console.log(child.foo);
	
}, 500);
