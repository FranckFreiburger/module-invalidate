require('../index.js');


var tmp_modulePath = require('path').join(__dirname, 'tmp_module.js');

require('fs').writeFileSync(tmp_modulePath, `
	module.invalidable = true;
    exports.a = 1;
`);


var tmp_module = require('./tmp_module.js');


console.log(tmp_module.a); // 1

require('fs').writeFileSync(tmp_modulePath, `
	module.invalidable = true;
    exports.a = 2;
`);


module.constructor.invalidateByExports(tmp_module);
//module.invalidateByPath('./tmp_module.js');

console.log(tmp_module.a); // 2

require('fs').unlinkSync(tmp_modulePath);