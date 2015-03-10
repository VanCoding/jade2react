require("jade2react");
var React = require("react");
var test = require("./test.jade");
var start = new Date().getTime();
console.log(React.renderToString(test({})));

console.log("rendered in ",new Date().getTime()-start,"ms");
