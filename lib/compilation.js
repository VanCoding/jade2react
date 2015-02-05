var fs = require("fs");
var dirname = require("path").dirname;
var parse = require("jade-parser");
var lex = require("jade-lexer");
var resolve = require("resolve");
var tags = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");

function Compilation(){
    this.level = 2;
    this.out = [];
    this.script = [];
}

Compilation.prototype.extend = function(base,main,nodes){
    for(var i = 0; i < nodes.length; i++){
        var node = nodes[i];
        if(node.type == "NamedBlock"){
            console.log(Object.keys(main))
            if(!main[node.name]){
                main[node.name] = node;
                node.parent = nodes;
            }else{
                var block = main[node.name];
                console.log("APPENDING!")
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
}

Compilation.prototype.parseDocument = function(path,base){
    var blocks = {};
    var tree = this.parseFile(path,base);
    while(tree.length && tree[0].type == "Extends"){
        tree.splice.apply(tree,[0,1].concat(this.parseFile(tree[0].path,path)));
    }
    this.extend(path,blocks,tree);
    for(var block in blocks){
        var index =
        Array.prototype.splice.apply(blocks[block].parent,[blocks[block].parent.indexOf(blocks[block]),1].concat(blocks[block].nodes));
    }
    console.log("BLOCKS",blocks)
    return tree;
}
Compilation.prototype.parseFile = function(path,base){
    return parse(lex(fs.readFileSync(resolve.sync(path,base?{basedir:dirname(base)}:undefined))+"")).nodes;
}

Compilation.prototype.compile = function(path){
    this.tree = this.parseDocument(path,__dirname)
    console.log(JSON.stringify(this.tree,null,"\t"))
    for(var i = 0; i < this.tree.length; i++){
        this.renderNode(this.tree[i]);
    }

    var code = [
        "var React = require(\"react\");",
        "var jade2react = require(\"jade2react\");",
        "",
    ].concat(this.script.join(""),[
        "",
        "exports.render = function(){",
        "\treturn jade2react.render(this,function(__add){",
        this.out.join(""),
        "\t})[0];",
        "}",
        "",
        "module.exports = React.createFactory(React.createClass(module.exports));",
        "module.exports.spec = exports"
    ]).join("\r\n");
    console.log(code);
    return code;
}

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
    this.write("__add(\""+node.val+"\");\r\n",0);
}

Compilation.prototype.renderCode = function(node){
    if(!node.val) return;
    if(node.block){
        this.write(node.val+"{\r\n",0);
        this.level++;
        this.renderNodes(node.block.nodes);
        this.write("}\r\n",-1);
    }else if(node.buffer){
        this.write("__add("+node.val+");\r\n",0);
    }else{
        this.write(node.val+"\r\n",0);
    }
}

Compilation.prototype.renderTag = function(node){
    if(node.name=="main"){
        this.script = [];
        if(this.tree.extends){
            this.script.push("jade2react.mixin(require(\""+this.tree.extends.replace(/\\/g,"/")+"\").spec,module.exports);");
        }
        for(var i = 0; i < node.nodes.length; i++){
            switch(node.nodes[i].type){
                case "Text":
                    this.script.push(node.nodes[i].val)
                    break;
                case "NewLine":
                    this.script.push("\r\n")
                    break;
            }

        }
    }else if(node.name == "children"){
        this.write("for(var i = 0; i < this.props.children.length; i++){\r\n",0);
        this.write("__add(this.props.children[i]);\r\n",1);
        this.write("}\r\n",-1);
    }else{
        this.write("__add("+(tags.indexOf(node.name)>=0?"React.DOM.":"")+node.name+",",0);

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
            this.write(",function(__add){\r\n");
            this.level++;
            this.renderNodes(node.nodes);
            this.write("});\r\n",-1);
        }else{
            this.write(");\r\n");
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
        if(node.attributeBlocks.length) this.write("jade2react.mixinAttributes(");
        var first = true;
        this.write("{");
        for(var att in attributes){
            this.write((first?"":",")+'"'+att+'":'+(att=="style"?"jade2react.mapStyle(":"")+attributes[att]+(att=="style"?")":""));
            first = false;
        }
        this.write("}");
        if(node.attributeBlocks.length) this.write(",["+node.attributeBlocks.join(",")+"])");
    }else{
        this.write("{}");
    }
}

Compilation.prototype.renderEach = function(node){
    this.write("for(var "+(node.key||"__key")+" in "+node.obj+"){\r\n",0);
    this.level++;
    if(node.val){
        this.write("var "+node.val+" = "+node.obj+"["+(node.key||"__key")+"];\r\n",0);
    }
    this.renderNodes(node.nodes);
    this.write("}\r\n",-1);
}

Compilation.prototype.renderComment = function(node){
    this.write("//"+node.val+"\r\n",0)
}

Compilation.prototype.renderBlockComment = function(node){
    this.write("/*\r\n",0);
    this.level++;
    for(var i = 0; i < node.nodes.length; i++){
        this.write(node.nodes[i].val+"\r\n",0);
    }
    this.write("*/\r\n",-1);
}

Compilation.prototype.renderCase = function(node){
    this.write("switch("+node.expr+"){\r\n",0);
    this.level++;
    this.renderNodes(node.nodes);
    this.write("}\r\n",-1);
}

Compilation.prototype.renderWhen = function(node){
    this.write("case "+node.expr+":\r\n",0);
    if(node.nodes){
        this.level++;
        this.renderNodes(node.nodes);
        this.write("break;\r\n",0);
        this.level--;
    }
}

Compilation.prototype.renderMixin = function(node){
    if(node.call){
        this.write(node.name+"(__add,",0);
        if(node.nodes){
            this.write("function(){\r\n");
            this.level++;
            this.renderNodes(node.nodes);
            this.write("},",-1);
        }else{
            this.write("null,");
        }
        this.renderAttributes(node);
        this.write(","+node.args+");\r\n");
    }else{
        var argparts = node.args.split("...");
        argparts[0] = argparts[0].trim();
        if(argparts[0][argparts[0].length-1] == ","){
            argparts[0] = argparts[0].slice(0,-1);
        }
        this.write("function "+node.name+"(__add,block,attributes,"+argparts[0]+"){\r\n",0);
        this.level++;
        if(argparts.length > 1){
            this.write("var "+argparts[1].trim()+" = Array.prototype.slice.call(arguments,"+argparts[0].split(",").length+");\r\n",0);
        }
        this.renderNodes(node.nodes)
        this.write("}\r\n",-1);
    }
}

Compilation.prototype.renderMixinBlock = function(node){
    this.write("block();\r\n",0)
}

Compilation.prototype.write = function(val,indent){
    if(indent !== undefined) this.indent(indent);
    this.out.push(val);
}

Compilation.prototype.indent = function(diff){
    if(diff) this.level += diff;
    this.write(new Array(this.level+1).join("\t"));
}

module.exports = Compilation;
