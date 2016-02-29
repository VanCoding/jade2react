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
