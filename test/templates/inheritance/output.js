"use strict";
var React = require("react");
var jade2react = require("jade2react");

class Component extends require("../block/input.jade"){
	_render(__add){
		super._render.call(this,__add);
	}
	render(){
		return jade2react.render(this,this._render)[0];
	}
	content(__add){
		super.content.call(this,__add);
		__add(React.createFactory('h1'),{},function(__add){
			__add("hello world");
		});
	}
}
module.exports = Component;
