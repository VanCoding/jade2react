jade2react
==========

A jade to react compiler, that lets you build react components using the jade
template language. It supports almost all features of jade and adds some more
functionality to make it even easier to build react components.

example
-------
```
doctype html
html
  head
    title Hello World
  body
    ul
      each entry,i in this.props.list
        li(onClick=this.alert)= entry
main.
    exports.alert = function(e){
        alert("You have clicked a list item!");
    }
```

**result**
```
var React = require("react");
var jade2react = require("jade2react");

exports.alert = function(e){
    alert("You have clicked a list item!");
}

exports.render = function(){
	return jade2react.render(this,function(__add){
		__add(React.DOM.html,{},function(__add){
			__add(React.DOM.head,{},function(__add){
				__add(React.DOM.title,{},function(__add){
					__add("Hello World");
				});
			});
			__add(React.DOM.body,{},function(__add){
				__add(React.DOM.ul,{},function(__add){
					for(var i in this.props.list){
						var entry = this.props.list[i];
						__add(React.DOM.li,{"onClick":this.alert},function(__add){
							__add(entry);
						});
					}
				});
			});
		});

	})[0];
}
module.exports = React.createClass(module.exports);
module.exports.spec = exports
```
installation
------------
jade2react is a registered npm module. So you can install it using the
following command:
`npm install jade2react`

features
--------
- Auto compilation: Just require any *.jade file and it gets loaded as
JavaScript. Just make sure you have required jade2react first and the module
react is available from the jade-file's location.
- This module provides also a transform function to autocompile *.jade files
while bundling them with browserify.

notes
-----

- While the `render` function is auto generated, you also can define
javascript, to be added to your component in the `main.` element. `exports`
represents the object that later gets passed to `React.createClass()`, so if you
define functions on it, the will later be available through `this`.
In here, you also can require other JavaScript modules or React components and
even other jade files. See example above.

    ```
    .main
        input(type="button" value="Click Me!" onClick=this.click)
    main.
        var somemodule = require("somemodule");

        exports.click = function(){
            somemodule.doSomething();
        }
    ```
- Extends still works! But not only the render function gets extended but the
whole component. All properties that are defined in the `exports` object in the
derived component automatically get mixed into the current exports object. So,
the following example will still work:

    ```
    //base.jade
    div
        block content
    main.
        exports.click = function(){
            alert("Clicked!")
        }

    ```
    ```
    //component.jade
    extends base
    append content
        div(onClick=this.click)
    ```

- Since React allows you to pass children to a component, I also made this
available. Just add an `children` element where you want your children to be
rendered:
    ```
    //list.jade
    .list
        h1 Children following
        children
    ```
You then can pass the children like you'd expect:
    ```
    //main.jade
    .main
        List
            p Child 1
            p Child 2
    main.
    var List = require("list.jade");
    ```

- Tag contents are always escaped. So `h1 hello <b>world</b>` will render as
`h1 hello &lt;b&gt;world&lt;/b&gt;` and not `h1 hello <b>world</b>`. This is
because in react you set either the full contents of a tag as insecure html,
or nothing. So while the above example would be no problem, the following
actually would be:
    ```
    div <b>hello</b>
        p world!
    ```
- You can define either the normal HTML/Jade way or the react way. The following
examples are the same:

    ```
    div(style="backgroundColor:red")
    ```
    ```
    div(style={backgroundColor:"red"})
    ```

Licence
-------

GPL, just ask me if that's a problem for you ;)
