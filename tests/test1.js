require('../index.js')

const a = require('./test1_a.js');

var tmp = 0;


//console.log(module.constructor._cache);

console.log('-- begin');
console.log(a());
console.log(a());
console.log('-- invalidate --');
module.invalidate('./test1_a.js');
console.log(a());
console.log(a());
console.log('-- end\n');


console.log('--', tmp++);
console.log('-- begin');
console.log(a());
console.log(a());
console.log('-- invalidate --');
module.invalidate('./test1_b.js');
console.log(a());
console.log(a());
console.log('-- end\n');


console.log('--', tmp++);
console.log('-- begin');
console.log(a());
console.log(a());
console.log('-- invalidate --');
module.constructor.invalidate();
console.log(a());
console.log(a());
console.log('-- end\n');


console.log('--', tmp++);
console.log('-- begin');
console.log(a());
console.log(a());
console.log('-- invalidate --');
module.invalidate();
console.log(a());
console.log(a());
console.log('-- end\n');

