# module-invalidate
Invalidate node.js modules loaded through `require()`


## Description
`module-invalidate` allows you to invalidate a given module (or all modules) and make it automatically reloaded on further access, no need to call `require()` again.  


## Install

`npm install --save module-invalidate`


## Examples


##### Example: simple case

###### module `./myModule.js`
```JavaScript
module.invalidable = true;

var count = 0;
exports.count = function() {

	return count++;
}
```

###### main module `./index.js`
```JavaScript
require('module-invalidate');

var myModule = require('./myModule.js');

console.log( myModule.count() ); // 0
console.log( myModule.count() ); // 1

module.constructor.invalidateByExports(myModule);

console.log( myModule.count() ); // 0
console.log( myModule.count() ); // 1
```


##### Example: invalidate module on modification

```JavaScript
const fs = require('fs');

var myModule = require('./myModule.js');

fs.watch(require.resolve('./myModule.js'), function() {
	
	module.invalidateByPath('./myModule.js');
});

setInterval(function() {
	
	console.log(myModule.count());
}, 1000);
```


##### Example:

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


##### Example:

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

In the following API, `Module` refers to the Module constructor, available with `module.constructor` or `require('Module')`.  
And `module` refers to a module instance, available in each module with `module`.


#### `require('module-invalidate')`
Enable the module-invalidate mechanism.  
Any nodejs-non-internal module loaded after this call can be handled by this library.


#### `module.invalidable`
This property controls whether the module can be invalidated. By default, modules are not invalidable.

##### Example:
###### module `./myModule.js`
```JavaScript
module.invalidable = true;
module.exports = {
	foo: function() {}
}
```

#### `module.invalidateByPath(path)`
Invalidates the specified module by its path (same syntax and context than `require()`). The module should have been flagged as invalidable using `module.invalidable`.

##### Example:
```JavaScript
require('module-invalidate');
var myModule = require('./myModule.js');
module.invalidateByPath('./myModule.js');
```


#### `Module.invalidateByExports(exports)`
Invalidates the module by giving its exported object. The module should have been flagged as invalidable using `module.invalidable`.  

##### Example:
```JavaScript
require('module-invalidate');
var myModule = require('./myModule.js');
module.constructor.invalidateByExports(myModule);
```

`invalidateByExports()` only invalidates one module.
###### module `B.js`
```
	module.invalidable = true;
	console.log('load B');
	module.exports = {
		foo: 123
	}
```

###### module `A.js`
```
	module.invalidable = true;
	console.log('load A');
	module.exports = require('./B.js');

```

###### main module `index.js`
```
	require('module-invalidate');
	var a = require('./A.js');
	console.log('invalidate');
	module.constructor.invalidateByExports(a);
	var tmp = a.foo;
```	

output:
```	
load A
load B
invalidate
load A
```	


#### `Module.invalidate()`
Invalidates all nodejs-non-internal modules. Only process modules that have been flagged as invalidable using `module.invalidable`.

##### Example:
```JavaScript
require('module-invalidate');
module.constructor.invalidate();
```


#### `module.invalidate()`
Invalidates the module `module`. The module should have been flagged as invalidable using `module.invalidable`.

##### Example:
```JavaScript
module.invalidate();
```

#### `module.unload()`
Definitely unloads the module `module`.


#### `module.unloadByPath(path)`
Definitely unloads the module by its path (same syntax and context than `require()`).


#### `Module.unloadByExports(exports)`
Definitely unloads the module by giving its exported object.


#### `module.onInvalidate(callback)`
callback: `function(immutable_exports)`

Register a callback that will be called when the module is invalidated. The `immutable_exports` is a permanent reference to the current `module.exports`.  
`onInvalidate` returns a function that unregisters the callback.

Gives you the opportunity to free resources created in the module.  
eg. temporary files, timers, web routes, ...

The `callback` can return function that is called after the module is reloaded. This can help you restore your module state.

##### Example:
```JavaScript
module.invalidable = true;
this.connectedUsers = [];
exports.connectUser = function(name) {
	
	this.connectedUsers.push(name);
}

exports.getConnectedUsers = function() {
	
	return this.connectedUsers;
}

module.onInvalidate(function(oldExports) {

	return function(newExports) {
		
		newExports.connectedUsers = oldExports.connectedUsers;
	}
});

```



## How it works

1. `Module.prototype.exports` is overridden by a No-op forwarding ES6 Proxy that handle all accesses to module exports.
1. When a module is invalidated, it is marked as *invalidated* and is then reloaded on the next access (lazily).



## Caveat

#### `typeof module.exports` is always `'function'`

Because the library is unable to know in advance what type of value will be assigned to `module.export`, it choose the most generic one as ES6 Proxy target.
However, `(function(){}) instanceof Object === true`


#### Only direct variable access is handled

##### Example:
```  
var foo = require('foo.js');
var bar = foo.bar;
```
In this case, `bar` will always refers to the initial `foo.bar` value. To avoid this, always refer `bar` using `foo.bar`.


#### Invalidated modules will survive with the new child-module version
In a module, `module.exports` will always refers to the latest version of the module.

##### Example:

###### module `./child.js`
```
module.invalidable = true;
module.exports = {};

setInterval(function() {
	console.log(module.exports.foo);
}, 1000);

```

###### main module `index.js`
```
require('module-invalidate');

var child = require('./child.js');
child.foo = 1;
module.constructor.invalidateByExports(child);
child.foo = 2;
```

###### output
```
2
2
2
2
2
...

```


## Credits

[Franck Freiburger](https://www.franck-freiburger.com)

