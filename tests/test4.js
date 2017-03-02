require('../index.js');

var ffi = require('./test4_native.js');

var libm = new ffi.Library('msvcrt', {
	'ceil': [ 'double', [ 'double' ] ]
})

console.log(libm.ceil(1.1));
