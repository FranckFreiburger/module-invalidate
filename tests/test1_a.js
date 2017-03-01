const b = require('./test1_b.js');

var a_val = 0;


module.exports = function() {
	
	return 'a:'+(a_val++)+' '+b();
}