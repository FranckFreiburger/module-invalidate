require('../index.js');


var a = require('./test6_a.js');

console.log('invalidate');
module.constructor.invalidateByExports(a); // invalidates module A and module B

var tmp = a.foo;
