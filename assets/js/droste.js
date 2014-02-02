var dim = 512;
var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(-1, 1, -1, 1, -1, 1);
var renderer = new THREE.WebGLRenderer();
var uniforms;
var gui;
var guiParameters;

// http://www.khronos.org/message_boards/showthread.php/7170-How-to-include-shaders
function getSourceSync(url) {
    var req = new XMLHttpRequest();
    req.open("GET", url, false);
    req.send(null);
    return (req.status == 200) ? req.responseText : null;
};

// given x in domain [x0,x1], return y in range [y0,y1]
function linlin(x0,x1,y0,y1,x) {
    var norm_x = (x-x0)/(x1-x0);
    var y = y0 + (y1-y0)*norm_x;
    return y
}

function initCanvas() {
    renderer.setSize(dim,dim);
    div = document.getElementById("placeholder");
    div.appendChild(renderer.domElement);

    var theTexture = THREE.ImageUtils.loadTexture('/assets/image/ocean_sunset512x512.jpg');
    //theTexture.minFilter = THREE.NearestFilter;
    // need wrapping enabled
    theTexture.wrapS = THREE.RepeatWrapping;
    theTexture.wrapT = THREE.RepeatWrapping;
    uniforms = {
        texture1: {type: "t",  value: theTexture},
        offset:   {type: "v2", value: new THREE.Vector2( 0.0, 0.0 )},
        r1:       {type: "f",  value: 0.10},
        r2:       {type: "f",  value: 20.00}
    };
    var vertShader = getSourceSync("/assets/js/droste.vert");
    var fragShader = getSourceSync("/assets/js/droste.frag");

    var mapMaterial = new THREE.ShaderMaterial({
        side:           THREE.DoubleSide,
        uniforms:       uniforms,
        vertexShader:   vertShader,
        fragmentShader: fragShader
    });

    var mapGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
    mapGeometry.faceVertexUvs[0] = [];
    var minUV = -5.0;
    var maxUV = 5.0;
    mapGeometry.faceVertexUvs[0].push([
        new THREE.Vector2(minUV, minUV),
        new THREE.Vector2(minUV, maxUV),
        new THREE.Vector2(maxUV, minUV)
    ]);
    mapGeometry.faceVertexUvs[0].push([
        new THREE.Vector2(minUV, maxUV),
        new THREE.Vector2(maxUV, maxUV),
        new THREE.Vector2(maxUV, minUV)
    ]);
    var map = new THREE.Mesh(mapGeometry, mapMaterial);
    scene.add(map);

    // http://skidding.github.io/dragdealer/
    // https://github.com/skidding/dragdealer/blob/master/src/dragdealer.js
    var r1h = document.getElementById("slider-r1-handle");
    var r2h = document.getElementById("slider-r2-handle");
    var minr1 = 0.001;
    var maxr1 = 1.0;
    var minr2 = 1.0;
    var maxr2 = 100.0;
    var updateR1Constraints = function() {
        if(typeof r2drag == 'undefined')
            return;
        var cur = r2drag.getValue();
        var v = linlin(0.0,1.0,minr2,maxr2,cur[0]);
        maxr1 = v;
    }
    var updateR2Constraints = function() {
        if(typeof r1drag == 'undefined')
            return;
        var cur = r1drag.getValue();
        var v = linlin(0.0,1.0,minr1,maxr1,cur[0]);
        minr2 = v;
    }
    var r1drag = new Dragdealer('slider-r1',{
        x: linlin(minr1, maxr1, 0.0, 1.0, 0.1),
        slide: false,
        animationCallback: function(x,y) {
            uniforms.r1.value = linlin(0.0, 1.0, minr1, maxr1, x);
            r1h.innerHTML = sprintf("r1=%.2f",uniforms.r1.value);
            updateR2Constraints();
        }
    });
    var r2drag = new Dragdealer('slider-r2',{
        x: linlin(minr2, maxr2, 0.0, 1.0, 20.0),
        slide: false,
        animationCallback: function(x,y) {
            uniforms.r2.value = linlin(0.0, 1.0, minr2, maxr2, x);
            r2h.innerHTML = sprintf("r2=%.0f",uniforms.r2.value);
            updateR1Constraints();
        }
    });

    /*
    GuiParameters = function() {
        this.r1 = 0.25;
        this.r2 = 10.0;
    };
    guiParameters = new GuiParameters();
    gui = new dat.GUI({ autoPlace: false });
    var drosteR1 = gui.add(guiParameters, 'r1').min(0.1).max(1.00).step(0.1);//.name('r1').listen();
    drosteR1.onChange(function(value) {
        uniforms.r1 = value;
    });
    var drosteR1 = gui.add(guiParameters, 'r2').min(1).max(20).step(1);//.name('r1').listen();
    drosteR1.onChange(function(value) {
        uniforms.r2 = value;
    });
    //gui.open();
    var customContainer = document.getElementById('placeholder');
    div.appendChild(gui.domElement);
    */
}

var render = function () {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
};

initCanvas();
render();
