require('../index.js');

var child = require('./test7_child.js');

child.foo = 1;

module.constructor.invalidateByExports(child);

child.foo = 2;
