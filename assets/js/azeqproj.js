// FIXME if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var dim = 512;
var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(-1, 1, -1, 1, -1, 1);
var renderer = new THREE.WebGLRenderer();
var uniforms;

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

var curLatitude = 0.0;
var curLongitude = 0.0;

function deg2rad(deg) {
    rad = deg*(Math.PI/180);
    return rad;
}

function rad2deg(rad) {
    deg = rad*(180/Math.PI);
    return deg;
}

function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(event) {
    if  (!mouseDown) {//(event.button === 0) {
        return;
    }
    var newX = event.clientX;
    var newY = event.clientY;

    var deltaX = newX - lastMouseX
    var deltaY = newY - lastMouseY;

    //var cur_latitude = deg2rad(parseFloat(document.getElementById("cur_latitude").value));
    //var cur_longitude = deg2rad(parseFloat(document.getElementById("cur_longitude").value));
    curLatitude += deltaY/100.0;
    curLongitude -= deltaX/100.0;
    //document.getElementById("cur_latitude").value = rad2deg(cur_latitude);
    //document.getElementById("cur_longitude").value = rad2deg(cur_longitude);

    lastMouseX = newX
    lastMouseY = newY;
}

function initCanvas() {
    renderer.setSize(dim,dim);
    div = document.getElementById("placeholder");
    div.appendChild(renderer.domElement);

    renderer.domElement.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    var worldTexture = THREE.ImageUtils.loadTexture('/assets/image/world512x256.jpg');
    //var worldTexture = THREE.ImageUtils.loadTexture('/assets/image/world1024x512.jpg');
    //worldTexture.magFilter = THREE.NearestFilter;
    worldTexture.minFilter = THREE.NearestFilter; // without this, there is a line where the world wraps
    worldTexture.wrapS = THREE.RepeatWrapping;
    worldTexture.wrapT = THREE.RepeatWrapping;
    uniforms = {
        texture1: { type: "t", value: worldTexture },
        phi1:     { type: "f", value: 0.0 },
        lambda0:  { type: "f", value: 0.0 }
    };
    var vertShader = document.getElementById('vertexShader').innerHTML;
    var fragShader = document.getElementById('fragmentShader').innerHTML;

    var mapMaterial = new THREE.ShaderMaterial({
        side:           THREE.DoubleSide,  // ARGH--very important!
        uniforms:       uniforms,
        vertexShader:   vertShader,
        fragmentShader: fragShader
    });

    var mapGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
    mapGeometry.faceVertexUvs[0] = [];
    mapGeometry.faceVertexUvs[0].push([
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, 1),
        new THREE.Vector2(1, 0)
    ]);
    mapGeometry.faceVertexUvs[0].push([
        new THREE.Vector2(0, 1),
        new THREE.Vector2(1, 1),
        new THREE.Vector2(1, 0)
    ]);
    var map = new THREE.Mesh(mapGeometry, mapMaterial);
    scene.add(map);

    var lineMaterial = new THREE.LineBasicMaterial( { color: 0xffff00 } );
    var crossGeometry = new THREE.Geometry();
    var crossDelta = 0.025;
    crossGeometry.vertices.push( new THREE.Vector3(-crossDelta, 0, 0.1 ) );
    crossGeometry.vertices.push( new THREE.Vector3( crossDelta, 0, 0.1 ) );
    crossGeometry.vertices.push( new THREE.Vector3( 0, 0, 0.1 ) );
    crossGeometry.vertices.push( new THREE.Vector3( 0,-crossDelta, 0.1 ) );
    crossGeometry.vertices.push( new THREE.Vector3( 0, crossDelta, 0.1 ) );
    var cross = new THREE.Line( crossGeometry, lineMaterial);
    scene.add(cross);

    // FIXME -- extra lines
    for(var i = 0; i < 1.0; i += 0.2) {
        var circleGeometry = new THREE.CircleGeometry( i, 200, i, 2*Math.PI);
        var circle = new THREE.Line(circleGeometry, lineMaterial);
        circle.translateZ(0.1);
        scene.add(circle);
    }
}

var render = function () {
    requestAnimationFrame(render);
    uniforms.phi1.value = curLatitude;
    uniforms.lambda0.value = curLongitude;
    renderer.render(scene, camera);
};

initCanvas();
render();
