"use strict";
var React = require("react");
var jade2react = require("jade2react");
//start

var Base = React.Component;
class Component extends Base{
	_render(__add){
		__add(jade2react.createFactory('div'),{});
	}
	render(){
		return jade2react.render(this,this._render)[0];
	}
	//body
}
module.exports = Component;

//end
