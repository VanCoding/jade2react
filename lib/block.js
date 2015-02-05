function Block(){
    this.out = [];
    this.newline = true;
}

Block.prototype.write = function(val,indent){
    if(this.newline){
        this.out.push([]);
        this.newline = false;
    }
    this.out[this.out.length-1].push(val);
    if(indent) this.indent(indent);
}

Block.prototype.newLine = function(){
    if(this.out[this.out.length-1] instanceof Array) this.out[this.out.length-1] = this.out[this.out.length-1].join("");
    this.newline = true;
}

Block.prototype.writeLine = function(val,indent){
    this.write(val,indent);
    this.newLine();
}

Block.prototype.indent = function(diff){
    if(diff) this.out.push(diff||1);
    this.newLine();
}

Block.prototype.writeBlock = function(block){
    this.out.push(block);
    this.newLine();
}

Block.prototype.build = function(level,arr){
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