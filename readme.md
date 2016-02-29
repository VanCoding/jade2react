jade2react
==========

A jade to react compiler, that lets you build complete react components using the
jade template language. It supports almost all features of jade and adds some
more functionality to make it even easier to build react components.


installation
------------
jade2react is a registered npm module. So you can install it using the
following command:
`npm install jade2react`

features
--------
- Functions to compile jade to react manually
- Require hook to compile jade to react automatically
- Transform function to compile jade to react with browserify.

hello world
-----------
Jade:

```jade
div hello world
```

Compiled:
```js
"use strict";
var React = require("react");
var jade2react = require("jade2react");

class Component extends React.Component{
	_render(__add){
		__add(React.createFactory('div'),{},function(__add){
			__add("hello world");
		});
	}
	render(){
		return jade2react.render(this,this._render)[0];
	}
}
module.exports = Component;
```

inheritance
-----------
Inheritance happens at runtime. The base-component gets loaded using require,
and then its class gets extended in ES6 style. So please use a path that require
can find for inheritance.

You currently can only extend components also compiled with jade2react. This
would maybe change in the future.

script blocks
-------------
It is possible to insert JavaScript into specific areas of your compiled component.
This allows you to for example import other Components or define some methods on
your class.

The sections are:

**start**
This section is at the beginning of the file. Insert code here to require other
Components, or do stuff before the class declaration.

**body**
This section is inside your class. You can define methods or static members.

**end (default)**
This section is at the end of the file. It's for doing stuff after your class has
been declared. You can for example mixin things into the class prototype. This is
also the default section, as it's the most powerful.

Jade: (don't forget periods)
```jade
Button(onClick=this.buttonClicked.bind(this))
script(section="start").
	var Button = require("my-button");
script(section="body").
	buttonClicked(){
		alert("button has been clicked!")
	}
script.
	module.exports.myVar = 5;
```
Here you can see the exact positions:
```js
"use strict";
var React = require("react");
var jade2react = require("jade2react");
var Button = require("my-button");

class Component extends React.Component{
	_render(__add){
		__add(React.createFactory(Button),{onClick:this.buttonClicked.bind(this)});
	}
	render(){
		return jade2react.render(this,this._render)[0];
	}
	buttonClicked(){
		alert("button has been clicked!")
	}
}
module.exports = Component;
module.exports.myVar = 5;
```

styles
------
You can define styles either the normal HTML/Jade way or the react way. The following
examples are the same:

```jade
div(style="backgroundColor:red")
```
```jade
div(style={backgroundColor:"red"})
```

everything's escaped
--------------------
Tag contents are always escaped. So `h1 hello <b>world</b>` will render as
`h1 hello &lt;b&gt;world&lt;/b&gt;` and not `h1 hello <b>world</b>`. This is
because in react you set either the full contents of a tag as insecure html,
or nothing. So while the above example would be no problem, the following
actually would be:

```jade
div <b>hello</b>
    p world!
```

examples
--------
For more examples, you can look at the tests. They should cover everything
jade2react is capable of.

License
-------

MPLv2, read [LICENSE.md](./LICENSE.md) for more information
