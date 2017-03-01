require('../index.js');

console.log(require('./test2_json_object.json').foo);
console.log(require('./test2_json_primitive.json'));

module.constructor.invalidate();

console.log(require('./test2_json_object.json').foo);
console.log(require('./test2_json_primitive.json'));
