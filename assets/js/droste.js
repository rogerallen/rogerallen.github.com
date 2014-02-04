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

    //var theTexture = THREE.ImageUtils.loadTexture('/assets/image/ocean_sunset512x512.jpg');
    //var theTexture = THREE.ImageUtils.loadTexture('/assets/image/image069.jpg');
    var theTexture = THREE.ImageUtils.loadTexture('/assets/image/grid.png');
    //theTexture.minFilter = THREE.NearestFilter;
    // need wrapping enabled
    theTexture.wrapS = THREE.RepeatWrapping;
    theTexture.wrapT = THREE.RepeatWrapping;
    uniforms = {
        texture1: {type: "t",  value: theTexture},
        scaleUv:  {type: "f",  value: 5.0},
        offsetUv: {type: "v2", value: new THREE.Vector2( 0.0, 0.0 )},
        r1:       {type: "f",  value: 1.0},
        r2:       {type: "f",  value: 256.00}
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
    var minUV = -1.0;
    var maxUV = 1.0;
    mapGeometry.faceVertexUvs[0].push([
        new THREE.Vector2(minUV, maxUV),
        new THREE.Vector2(minUV, minUV),
        new THREE.Vector2(maxUV, maxUV)
    ]);
    mapGeometry.faceVertexUvs[0].push([
        new THREE.Vector2(minUV, minUV),
        new THREE.Vector2(maxUV, minUV),
        new THREE.Vector2(maxUV, maxUV)
    ]);
    var map = new THREE.Mesh(mapGeometry, mapMaterial);
    scene.add(map);

    // http://skidding.github.io/dragdealer/
    // https://github.com/skidding/dragdealer/blob/master/src/dragdealer.js
    var r1h = document.getElementById("slider-r1-handle");
    var r2h = document.getElementById("slider-r2-handle");
    var scaleUvh = document.getElementById("slider-scaleUv-handle");
    var minr1 = 0.001;
    var maxr1 = 10.0;
    var minr2 = 100.0;
    var maxr2 = 1000.0;
    var minscaleUv = 0.01;
    var maxscaleUv = 1.0;
    var r1drag = new Dragdealer('slider-r1',{
        x: linlin(minr1, maxr1, 0.0, 1.0, 1.0),
        slide: false,
        animationCallback: function(x,y) {
            uniforms.r1.value = linlin(0.0, 1.0, minr1, maxr1, x);
            r1h.innerHTML = sprintf("r1=%.2f",uniforms.r1.value);
        }
    });
    var r2drag = new Dragdealer('slider-r2',{
        x: linlin(minr2, maxr2, 0.0, 1.0, 256.0),
        slide: false,
        animationCallback: function(x,y) {
            uniforms.r2.value = linlin(0.0, 1.0, minr2, maxr2, x);
            r2h.innerHTML = sprintf("r2=%.0f",uniforms.r2.value);
        }
    });
    var scaleUvdrag = new Dragdealer('slider-scaleUv',{
        x: linlin(minscaleUv, maxscaleUv, 0.0, 1.0, 0.2),
        slide: false,
        animationCallback: function(x,y) {
            uniforms.scaleUv.value = linlin(0.0, 1.0, minscaleUv, maxscaleUv, x);
            scaleUvh.innerHTML = sprintf("scaleUv=%.2f",uniforms.scaleUv.value);
        }
    });
}

var render = function () {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
};

initCanvas();
render();
