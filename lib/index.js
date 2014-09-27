var jade = require("jade");
var Compilation = require("./compilation.js");
var path = require("path");


exports.compile = function(str,opts){
    var tree = new jade.Parser(str, opts.filename, opts).parse();
    return new Compilation(tree,opts.name||path.basename(opts.filename).slice(0,-5)).compile();
}
