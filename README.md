# module-invalidate
Invalidate node.js modules loaded through `require()`


## Description
`module-invalidate` allows you to invalidate a given module (or all modules) and make it automatically reloaded on further access.  
Loaded module (using `require()`) are handled by a No-op forwarding ES6 Proxy that handle module access.  


## Install

`npm install --save FranckFreiburger/module-invalidate`


## Examples

### 1

```JavaScript
require('module-invalidate');

var foo = require('foo');

console.log(foo.bar); // a value

// -- 'foo' module has changed --

myFooBarSystem.on('reloadModules', function() {
	
	module.constructor.invalidateByExports(foo);

	console.log(foo.bar); // a new value
})
```


### 2

```JavaScript
require('module-invalidate');


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


module.invalidateByPath('./tmp_module.js'); // or module.constructor.invalidateByExports(tmp_module)

console.log(tmp_module.a); // 2

require('fs').unlinkSync(tmp_modulePath);

```


## API


##### require('module-invalidate')
Enable the module-invalidate mechanism.  
Any nodejs-non-internal module loaded after this call are handeled by this library.


##### module.invalidable
This property controls whether the module can be invalidated. By default, modules are not invalidable. This property has to be set before exporting.

###### Example:
module `./myModule.js`
```JavaScript
module.invalidable = true;
module.exports = {
	foo: function() {}
}
```

##### module.invalidateByPath(path)
Invalidates the specified module (same syntax and context than `require()`).

###### Example:
```JavaScript
require('module-invalidate');
var myModule = require('./myModule.js');
module.invalidateByPath('./myModule.js');
```


##### module.invalidateByExports(exports)
Invalidates the module by giving its exported object.

###### Example:
```JavaScript
require('module-invalidate');
var myModule = require('./myModule.js');
module.invalidateByExports(myModule);
```


##### Module.invalidate()
Invalidates all nodejs-non-internal modules.  
`Module` is available with `module.constructor` or `require('module')`.

###### Example:
```JavaScript
require('module-invalidate');
module.constructor.invalidate();
```


##### module.invalidate()
Invalidates the module `module`.

###### Example:
```JavaScript
module.invalidate();
```


## How it works

1. `Module.prototype.exports` is overridden by a No-op forwarding ES6 Proxy that handle all accesses to module exports.
1. When a module is invalidated, it is marked as *invalidated* and is then reloaded on the next access (lazily).



## Caveat


#### ownKeys is not supported

Reflect.ownKeys(), Object.keys(), for-in loop, console.log(), ... are not available on the module exports (only).
eg.
```
Object.keys(require('foo.js'));
```
will throw a `TypeError: ownKeys not implemented` exception.  
However for-of loop works properly.


#### Only direct variable access is handled
```  
var foo = require('foo.js');
var bar = foo.bar;
```
In this case, `bar` will always refers to the initial `foo.bar` value. To avoid this, always refer `bar` using `foo.bar`.


#### Invalidated modules may survive with new sub-module versions
Any reference to an invalidated module will continue to live with its new version.

```
TBD example  
```

## To be done

1. make module-invalidate enable for selected modules
1. allow module to be aware of their invalidation.


## Credits

[Franck Freiburger](https://www.franck-freiburger.com)

