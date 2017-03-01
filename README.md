# module-invalidate
Invalidate node.js modules loaded through require()


## Examples

```JavaScript
require('module-invalidate');


var tmp_modulePath = require('path').join(__dirname, 'tmp_module.js');

require('fs').writeFileSync(tmp_modulePath, `
	exports.a = 1;
`);

var tmp_module = require('./tmp_module.js');


console.log(tmp_module.a); // 1

require('fs').writeFileSync(tmp_modulePath, `
	exports.a = 2;
`);


module.invalidate('./tmp_module.js');

console.log(tmp_module.a); // 2

require('fs').unlinkSync(tmp_modulePath);

```


## API

##### Module.invalidate()

Invalidates all nodejs-internal modules.

`Module` is available with `module.constructor` or `require('module')`


##### module.invalidate([path])

Invalidates the module `module`.

`path` (optional): Invalidates the specified module (same syntax and same context as `require()`)


## How it works

1. `Module.prototype.exports` is overridden by a ES6 Proxy that handle all accesses to module exports.
1. When a module is invalidated, it is marked as *invalidated* and is then reloaded on the next access.


## Caveat

- Object.keys(), for-in loop, console.log(), ... are not available on the module exports.

## Credits

[Franck Freiburger](https://www.franck-freiburger.com)
