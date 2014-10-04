var jade = require("jade");
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
        stream.queue(module.exports.compile(data.join(""),{filename:file}));
        stream.queue(null);
    });

    return stream;
}

module.exports.compile = function(str,opts){
    var tree = new jade.Parser(str, opts.filename, opts).parse();
    return new Compilation(tree,opts.name||path.basename(opts.filename).slice(0,-5)).compile();
}

module.exports.compileFile = function(path,opts){
    opts = opts|| {};
    opts.filename = path;
    return module.exports.compile(fs.readFileSync(path)+"",opts);
}

require.extensions[".jade"] = function(m,filename){
    m._compile(module.exports.compileFile(filename),filename);
}

module.exports.render = client.render;
module.exports.mixin = client.mixin;
module.exports.mixinAttributes = client.mixinAttributes;
module.exports.mapStyle = client.mapStyle;
