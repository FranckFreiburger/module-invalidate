# module-invalidate
Invalidate node.js modules loaded through `require()`


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

##### require('module-invalidate')

Enable the module-invalidate mechanism.
Any nodejs-non-internal module loaded after this call are handeled by this library.


##### Module.invalidate()

Invalidates all nodejs-non-internal modules.

`Module` is available with `module.constructor` or `require('module')`


##### module.invalidate([path])

Invalidates the module `module`.

`path` (optional): Invalidates the specified module (same syntax and same context as `require()`)


## How it works

1. `Module.prototype.exports` is overridden by a ES6 Proxy that handle all accesses to module exports.
1. When a module is invalidated, it is marked as *invalidated* and is then reloaded on the next access (lazily).


## Caveat

#### ownKeys is not supported

Object.keys(), for-in loop, console.log(), ... are not available on the module exports.
eg.
```
Object.keys(require('foo.js'));
```
will throw a `TypeError: ownKeys not implemented` exception.

#### Only direct variable access is handled
```  
var foo = require('foo.js');
var bar = foo.bar;
```
In this case, `bar` will always refers to the initial `foo.bar` value. To avoid this, always refer `bar` using `foo.bar`.


## Credits

[Franck Freiburger](https://www.franck-freiburger.com)
