function render(renderBody){
    var children = [];
    renderBody(function(component,attributes,sub){
        children.push(create(component,attributes,sub));
    })
    return children;
}

function create(component,attributes,sub){
    if(component instanceof Function){
        return component.apply(component,sub?[attributes].concat(render(sub)):[attributes])
    }else{
        return component;
    }
}

module.exports = render;
