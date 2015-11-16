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
- Auto compilation: Just require any .jade file and it gets loaded as
JavaScript. Just make sure you have required jade2react first and the module
react is available from the jade-file's location.
- This module provides also a transform function to autocompile .jade files
while bundling them with browserify.

changes from 0.2.* to 0.3.*
---------------------------
- jade2react now supports react 0.14.*
- jade2react now exports your component directly, instead of a factory for it

notes
-----

- While the `render` function is auto generated, you also can define
javascript, to be added to your component in `script.` elements on the indentation
level 0. `exports` represents the object that later gets passed to 
`React.createClass()`, so if you define functions on it, the will later be available
through `this`. In here, you also can require other JavaScript modules or React
components and even other jade files. See example above.

```jade
div
    input(type="button" value="Click Me!" onClick=this.click)
script.
    var somemodule = require("somemodule");

    exports.click = function(){
        somemodule.doSomething();
    }
```
- Extends still works! But not only the render function gets extended but the
whole component. All properties that are defined in the `exports` object in the
derived component automatically get mixed into the current exports object. So,
the following example will still work:

base.jade

```jade
div
    block content
script.
    exports.click = function(){
        alert("Clicked!")
    }
```
    
component.jade

```jade
extends ./base.jade
append content
    div(onClick=this.click)
```

- Since React allows you to pass children to a component, I also made this
available. Just add an `children` element where you want your children to be
rendered:

list.jade

```jade
.list
    h1 Children following
    children
```
You then can pass the children like you'd expect:

component.jade

```jade
.main
    List
        p Child 1
        p Child 2
script.
    var List = require("list.jade");
```

- Tag contents are always escaped. So `h1 hello <b>world</b>` will render as
`h1 hello &lt;b&gt;world&lt;/b&gt;` and not `h1 hello <b>world</b>`. This is
because in react you set either the full contents of a tag as insecure html,
or nothing. So while the above example would be no problem, the following
actually would be:

```jade
div <b>hello</b>
    p world!
```
- You can define styles either the normal HTML/Jade way or the react way. The following
examples are the same:

```jade
div(style="backgroundColor:red")
```
```jade
div(style={backgroundColor:"red"})
```

License
-------

MPLv2, read [LICENSE.md](./LICENSE.md) for more information
