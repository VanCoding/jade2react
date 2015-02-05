require("jade2react");
var React = require("react");
var test = require("./test.jade");
console.log(React.renderToString(test({})));
