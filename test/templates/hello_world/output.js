"use strict";
var React = require("react");
var jade2react = require("jade2react");

var Base = React.Component;
class Component extends Base{
	_render(__add){
		__add(jade2react.createFactory('div'),{},function(__add){
			__add("hello world");
		});
	}
	render(){
		return jade2react.render(this,this._render)[0];
	}
}
module.exports = Component;
