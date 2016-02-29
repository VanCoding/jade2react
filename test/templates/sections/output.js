"use strict";
var React = require("react");
var jade2react = require("jade2react");
//start

class Component extends React.Component{
	_render(__add){
		__add(React.createFactory('div'),{});
	}
	render(){
		return jade2react.render(this,this._render)[0];
	}
	//body
}
module.exports = Component;

//end
