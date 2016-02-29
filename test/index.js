"use strict";
var fs = require("fs");
var path = require("path");
var jsdiff = require("diff");
require("colors");
var jade2react = require("../lib/server.js");

var templates = fs.readdirSync(path.resolve(__dirname,"templates"))
for(var i = 0; i < templates.length; i++){
	var input = fs.readFileSync(path.resolve(__dirname,"templates",templates[i],"input.jade")).toString("utf8");
	var expectedOutput = fs.readFileSync(path.resolve(__dirname,"templates",templates[i],"output.js")).toString("utf8").trim().replace(/\r\n/g,"\n");
	var realOutput = jade2react.compile(input).toString("utf8").trim();

	if(realOutput != expectedOutput){
		process.stderr.write("Template "+templates[i]+" does not compile as expected!\n");
		var diff = jsdiff.diffLines(expectedOutput, realOutput);
		diff.forEach(function(part){
			var color = part.added ? 'green' : (part.removed ? 'red' : 'grey');
			process.stderr.write(part.value[color]);
		});
	}
	require("./templates/"+templates[i]+"/output.js");
}
