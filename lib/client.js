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

exports.render = render;
