var lex = require("jade-lexer");
var parse = require("jade-parser");
var Compilation = require("./compilation.js");
var path = require("path");
var fs = require("fs");
var through = require("through");
var client = require("./client.js");

module.exports = function(file){
    if(!/.jade$/.test(file)) return through();

    var data = [];
    var stream = through(function(d){
        data.push(d+"");
    },function(){
        stream.queue(module.exports.compile(data.join(""),file));
        stream.queue(null);
    });

    return stream;
}

module.exports.compile = function(str,file){
    var tree = parse(lex(str), file);
    return new Compilation(tree,path.basename(file).slice(0,-5)).compile();
}

module.exports.compileFile = function(file){
    return module.exports.compile(fs.readFileSync(file)+"",file);
}

require.extensions[".jade"] = function(m,file){
    m._compile(module.exports.compileFile(file),file);
}

module.exports.render = client.render;
module.exports.mixin = client.mixin;
module.exports.mixinAttributes = client.mixinAttributes;
module.exports.mapStyle = client.mapStyle;
