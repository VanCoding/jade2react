"use strict";
var React = require("react");
var jade2react = require("jade2react");

class Component extends React.Component{
	_render(__add){
		__add(React.createFactory('div'),{},function(__add){
			this.content(__add);
		});
	}
	render(){
		return jade2react.render(this,this._render)[0];
	}
	content(__add){
	}
	member(){
		console.log("I'm a member!");
	}
}
module.exports = Component;

Component.prototype.test = function(){
	console.log("hello world!");
}
