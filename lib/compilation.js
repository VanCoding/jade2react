var parse = require("jade-parser");
var lex = require("jade-lexer");
var Block = require("./block.js");
var tags = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");

function Compilation(doc,path){
    this.path = path;
    this.tree = parse(lex(doc)).nodes;
    
    this.main = new Block();    
    this.script = new Block();
    this.extendblock = new Block();
    this.blocks = new Block();    
    this.block = this.main;
    this.blocklist = {};
}

Compilation.prototype = Object.create(Block.prototype);

Compilation.prototype.compile = function(){
    //this.tree = this.parseDocument(path,__dirname)
    //this.analyze(this.tree); 
    
    this.deblock(this.tree);  
    
    //console.log(JSON.stringify(this.tree,null,"\t")); 
    
    this.block.writeLine("var React = require(\"react\");");
    this.block.writeLine("var jade2react = require(\"jade2react\");");
    this.block.writeLine("");
    this.block.writeLine("exports = module.exports = function(){return Component.apply(this,arguments)}")
    this.block.writeLine("");
    this.block.writeBlock(this.extendblock);
    this.block.writeLine("if(!exports.blocks){",1);
    this.block.writeLine("exports.blocks = {}",-1);
    this.block.writeLine("}else{",1);
    this.block.writeLine("var blocks = {};");
    this.block.writeLine("for(var block in exports.blocks){",1);
    this.block.writeLine("blocks[block] = exports.blocks[block].slice(0);",-1);
    this.block.writeLine("}");
    this.block.writeLine("exports.blocks = blocks;",-1);
    this.block.writeLine("}");

    this.block.writeLine("exports._render = function(__add){",1);
    for(var i = 0; i < this.tree.length; i++){
        this.renderNode(this.tree[i]);
    }
    this.block.indent(-1);
    this.block.writeLine("}");
    this.block.writeLine("exports.render = function(){",1);   
    this.block.writeLine("return jade2react.render(this,this._render)[0];",-1);
    this.block.writeLine("}");
    this.block.writeLine("");
    for(var block in this.blocklist){
        this.block.writeLine("if(!exports.blocks['"+block+"']) exports.blocks['"+block+"'] = [];");
        for(var i = 0; i < this.blocklist[block].length; i++){
            var b = this.blocklist[block][i];
            switch(b.mode){
                case "replace":
                    this.block.writeLine("exports.blocks['"+block+"'] = [];");
                case "append":
                    this.block.writeLine("exports.blocks['"+block+"'].push(function(__add){",1);
                    break;
                case "prepend":
                    this.block.writeLine("exports.blocks['"+block+"'].unshift(function(__add){",1);
                    break;
            }
            this.renderNodes(b.nodes);
            this.block.indent(-1);
            this.block.writeLine("});");            
        }
    }
    this.block.writeLine("var Component =  React.createFactory(React.createClass(module.exports));")
    this.block.writeLine("");
    this.block.writeBlock(this.script);

    var code = this.block.build();
    console.log(code);
    return code;
}

Compilation.prototype.deblock = function(nodes){
    for(var i = 0; i < nodes.length; i++){
        var node = nodes[i];
        if(node.block) node.nodes = node.block.nodes;
        if(node.nodes) this.deblock(node.nodes);
    }
}

/*
Compilation.prototype.analyze = function(nodes){
    for(var i = 0; i < nodes.length; i++){
        var node = nodes[i];
        if(node.type == "NamedBlock"){
            
        }
    }
}

Compilation.prototype.parseDocument = function(path,base){
    var blocks = {};
    var tree = this.parseFile(path,base);
    while(tree.length && tree[0].type == "Extends"){
        tree.splice.apply(tree,[0,1].concat(this.parseFile(tree[0].path,path)));
    }
    this.extend(blocks,tree);
    for(var block in blocks){
        Array.prototype.splice.apply(blocks[block].parent,[blocks[block].parent.indexOf(blocks[block]),1].concat(blocks[block].nodes));
    }
    return tree;
}

Compilation.prototype.parseFile = function(path,base){
    var nodes = parse(lex(fs.readFileSync(resolve.sync(path,base?{basedir:dirname(base)}:undefined))+"")).nodes;
    this.include(nodes,path);
    return nodes;
}

Compilation.prototype.include = function(nodes,base){
    for(var i = 0; i < nodes.length; i++){
        var node = nodes[i];
        if(node.type == "NamedBlock" || node.type == "Block"){
            console.log(node);
            this.include(node.nodes,base);
        }else if(node.type == "Include"){
            Array.prototype.splice.apply(nodes,[i,1].concat(this.parseDocument(node.path,base)));
        }else if(node.block && node.block.nodes){
            this.include(node.block.nodes,base);
        }
    }
}

Compilation.prototype.extend = function(main,nodes){
    for(var i = 0; i < nodes.length; i++){
        var node = nodes[i];
        if(node.type == "NamedBlock"){
            if(!main[node.name]){
                main[node.name] = node;
                node.parent = nodes;
            }else{
                var block = main[node.name];
                Array.prototype.splice.apply(block.nodes,[node.type == "append"?block.nodes.length:0,0].concat(node.nodes));
                nodes.splice(i--,1);
            }
            if(node.nodes) this.extend(main,node.nodes);
        }else if(node.block && node.block.nodes){
            node.nodes = node.block.nodes;
            delete node.block;
            this.extend(main,node.nodes);
        }
    }
}*/

Compilation.prototype.renderNode = function(node){
    switch(node.type){
        case "Text":
        case "Code":
        case "Tag":
        case "Block":
        case "Each":
        case "Comment":
        case "BlockComment":
        case "Case":
        case "When":
        case "Mixin":
        case "MixinBlock":
        case "Extends":
        case "NamedBlock":
            this["render"+node.type](node);
            break;
    }
}

Compilation.prototype.renderNodes = function(nodes){
    for(var i = 0; i < nodes.length; i++){
        this.renderNode(nodes[i]);
    }
}

Compilation.prototype.renderText = function(node){
    if(!node.val) return;
    this.block.writeLine("__add(\""+node.val+"\");");
}

Compilation.prototype.renderCode = function(node){
    if(!node.val) return;
    if(node.block){
        this.block.writeLine(node.val+"{",1);
        this.renderNodes(node.block.nodes);
        this.block.indent(-1);
        this.block.writeLine("}");
    }else if(node.buffer){
        this.block.writeLine("__add("+node.val+");");
    }else{
        this.block.writeLine(node.val);
    }
}

Compilation.prototype.renderTag = function(node){
    if(node.name=="main"){
        for(var i = 0; i < node.nodes.length; i++){
            switch(node.nodes[i].type){
                case "Text":
                    this.script.writeLine(node.nodes[i].val);
                    break;
                case "NewLine":
                    this.script.writeLine();
                    break;
            }

        }
    }else if(node.name == "children"){
        this.block.writeLine("for(var i = 0; i < this.props.children.length; i++){",1);
        this.block.writeLine("__add(this.props.children[i]);",-1);
        this.block.writeLine("}");
    }else{
        this.block.write("__add("+(tags.indexOf(node.name)>=0?"React.DOM.":"")+node.name+",");

        if(node.code && node.code.val){
            node.nodes.unshift(node.code)
        }

        if(node.name == "script" || node.name == "style"){
            var script = [];
            for(var i = 0; i < node.nodes.length; i++){
                switch(node.nodes[i].type){
                    case "Code":
                        script.push(node.nodes[i].val);
                        break;
                    case "Text":
                        script.push("\""+node.nodes[i].val.replace(/"/g,"\\\"")+"\"");
                        break;
                    case "NewLine":
                        script.push("\"\\r\\n\"");
                        break;
                }
            }
            script = script.join(" + ");
            if(script){
                node.attrs.push({
                    name:"dangerouslySetInnerHTML",
                    val:"{__html:"+script+"}"
                })
            }
            node.nodes = [];
        }
        this.renderAttributes(node);

        if(node.nodes.length){
            this.block.writeLine(",function(__add){",1);
            this.renderNodes(node.nodes);
            this.block.indent(-1);
            this.block.writeLine("});");
        }else{
            this.block.writeLine(");");
        }
    }
}

Compilation.prototype.renderBlock = function(node){
    this.renderNodes(node.nodes);
}

Compilation.prototype.renderAttributes = function(node){
    if(node.attrs){
        var attributes = {};
        for(var i = 0; i < node.attrs.length; i++){
            var att = node.attrs[i];
            if(attributes[att.name] && att.name == "class"){
                attributes[att.name] += " + \" \" + "+att.val;
            }else{
                attributes[att.name] = att.val;
            }
        }

        if(attributes.class){
            attributes.className = attributes.class;
            delete attributes.class;
        }
        if(node.attributeBlocks.length) this.block.write("jade2react.mixinAttributes(");
        var first = true;
        this.block.write("{");
        for(var att in attributes){
            this.block.write((first?"":",")+'"'+att+'":'+(att=="style"?"jade2react.mapStyle(":"")+attributes[att]+(att=="style"?")":""));
            first = false;
        }
        this.block.write("}");
        if(node.attributeBlocks.length) this.block.write(",["+node.attributeBlocks.join(",")+"])");
    }else{
        this.block.write("{}");
    }
}

Compilation.prototype.renderEach = function(node){
    this.block.writeLine("for(var "+(node.key||"__key")+" in "+node.obj+"){",1);
    if(node.val){
        this.block.writeLine("var "+node.val+" = "+node.obj+"["+(node.key||"__key")+"];");
    }
    this.renderNodes(node.nodes);
    this.block.indent(-1);
    this.block.writeLine("}");
}

Compilation.prototype.renderComment = function(node){
    this.block.writeLine("//"+node.val)
}

Compilation.prototype.renderBlockComment = function(node){
    this.block.writeLine("/*",1);
    for(var i = 0; i < node.nodes.length; i++){
        this.block.writeLine(node.nodes[i].val);
    }
    this.block.indent(-1);
    this.block.writeLine("*/");
}

Compilation.prototype.renderCase = function(node){
    this.block.writeLine("switch("+node.expr+"){",1);
    this.renderNodes(node.nodes);
    this.block.indent(-1);
    this.block.writeLine("}");
}

Compilation.prototype.renderWhen = function(node){
    this.block.writeLine("case "+node.expr+":",1);
    if(node.nodes){
        this.renderNodes(node.nodes);
        this.block.writeLine("break;");
    }
    this.block.indent(-1);
}

Compilation.prototype.renderMixin = function(node){
    if(node.call){
        this.block.write(node.name+"(__add,");
        if(node.nodes){
            this.block.writeLine("function(){",1);
            this.renderNodes(node.nodes);
            this.block.indent(-1);
            this.block.write("},");
        }else{
            this.block.write("null,");
        }
        this.renderAttributes(node);
        this.block.writeLine(","+node.args+");");
    }else{
        var argparts = node.args.split("...");
        argparts[0] = argparts[0].trim();
        if(argparts[0][argparts[0].length-1] == ","){
            argparts[0] = argparts[0].slice(0,-1);
        }
        this.block.writeLine("function "+node.name+"(__add,block,attributes,"+argparts[0]+"){",1);
        if(argparts.length > 1){
            this.block.writeLine("var "+argparts[1].trim()+" = Array.prototype.slice.call(arguments,"+argparts[0].split(",").length+");");
        }
        this.renderNodes(node.nodes)
        this.block.indent(-1);
        this.block.writeLine("}");
    }
}

Compilation.prototype.renderMixinBlock = function(node){
    this.block.writeLine("block();")
}

Compilation.prototype.renderExtends = function(node){
    this.extendblock.writeLine("jade2react.mixin(require(\""+node.path.replace(/\\/g,"/")+"\"),module.exports);");
    this.block.writeLine("require(\""+node.path+"\")._render.call(this,__add);");
}

Compilation.prototype.renderNamedBlock = function(node){
    if(!this.blocklist[node.name]) this.blocklist[node.name] = [];
    this.blocklist[node.name].push(node);
    if(node.mode == "replace" || node.mode === undefined){
        this.block.writeLine("for(var i = 0; i < this.blocks['"+node.name+"'].length; i++) this.blocks['"+node.name+"'][i].call(this,__add);")
    }
}

module.exports = Compilation;
