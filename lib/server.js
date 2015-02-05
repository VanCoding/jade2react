var lex = require("jade-lexer");
var parse = require("jade-parser");
var Compilation = require("./compilation.js");
var path = require("path");
var fs = require("fs");
var through = require("through");
var client = require("./client.js");

exports = module.exports = function(file){
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

exports.compile = function(str,file){
    return new Compilation().compile(file);
}

exports.compileFile = function(file){
    return module.exports.compile(fs.readFileSync(file)+"",file);
}

require.extensions[".jade"] = function(m,file){
    m._compile(module.exports.compileFile(file),file);
}

exports.render = client.render;
exports.mixin = client.mixin;
exports.mixinAttributes = client.mixinAttributes;
exports.mapStyle = client.mapStyle;
