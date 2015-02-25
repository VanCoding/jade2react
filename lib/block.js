var Block = module.exports = function Block(){
    this.out = [];
    this.newline = true;
}

Block.prototype.push = function(val){
    if(this.out[this.out.length-1] instanceof Array) this.out[this.out.length-1] = this.out[this.out.length-1].join("");
    this.out.push(val);
    this.newline = true
}

Block.prototype.write = function(val,indent){
    if(this.newline){
        this.push([]);
        this.newline = false;
    }
    this.out[this.out.length-1].push(val);
    if(indent) this.indent(indent);
}


Block.prototype.writeLine = function(val,indent){
    this.write(val);
    this.newline = true;
    if(indent) this.indent(indent);
}

Block.prototype.indent = function(diff){
    if(diff) this.push(diff||1);
}

Block.prototype.writeBlock = function(block){
    this.push(block);
}

Block.prototype.build = function(level,arr){
    if(this.out[this.out.length-1] instanceof Array) this.out[this.out.length-1] = this.out[this.out.length-1].join("");
    level = level||0;
    arr = arr||[];
    for(var i = 0; i < this.out.length; i++){
        var entry = this.out[i];
        if(typeof entry == "string"){
            arr.push(new Array(level+1).join("\t")+entry+"\r\n");
        }else if(typeof entry == "number"){
            level += entry;
        }else if(entry instanceof Block){
            entry.build(level,arr);
        }
    }
    return arr.join("");
}