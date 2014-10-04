function render(self,renderBody){
    var children = [];
    renderBody.call(self,function(component,attributes,sub){
        if(component instanceof Function){
            children.push(component.apply(component,sub?[attributes].concat(render(self,sub)):[attributes]));
        }else{
            children.push(component);
        }
    });
    return children;
}

function mixin(source,target){
    for(var key in source){
        target[key] = source[key];
    }
}

function mapStyle(style){
    if(typeof style == "object") return style;
    var defs = (style+"").split(";");
    style = {};
    for(var def in defs){
        def = defs[def].split(":");
        style[def[0]] = def[1];
    }
    return style;
}

exports.render = render;
exports.mixin = mixin;
exports.mapStyle = mapStyle;
