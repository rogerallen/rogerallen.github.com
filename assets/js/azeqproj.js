if (!Detector.webgl) Detector.addGetWebGLMessage({ id: "placeholder" });

var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(-1, 1, -1, 1, -1, 1);
var renderer = new THREE.WebGLRenderer();
var uniforms;

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

var curLatitude = 0.0;
var curLongitude = 0.0;

// http://www.khronos.org/message_boards/showthread.php/7170-How-to-include-shaders
function getSourceSync(url) {
    var req = new XMLHttpRequest();
    req.open("GET", url, false);
    req.send(null);
    return (req.status == 200) ? req.responseText : null;
};

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function rad2deg(rad) {
    return rad * (180 / Math.PI);
}

function handleMouseDown(event) {
    if (event.button !== 0) return; // left button only
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    renderer.domElement.setPointerCapture(event.pointerId);
}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(event) {
    if (!mouseDown) {
        return;
    }
    var newX = event.clientX;
    var newY = event.clientY;

    var deltaX = newX - lastMouseX
    var deltaY = newY - lastMouseY;

    //var cur_latitude = deg2rad(parseFloat(document.getElementById("cur_latitude").value));
    //var cur_longitude = deg2rad(parseFloat(document.getElementById("cur_longitude").value));

    curLatitude += deltaY / 100.0;
    curLongitude -= deltaX / 100.0;

    //document.getElementById("cur_latitude").value = rad2deg(cur_latitude);
    //document.getElementById("cur_longitude").value = rad2deg(cur_longitude);

    lastMouseX = newX
    lastMouseY = newY;
}

function initCanvas() {
    div = document.getElementById("placeholder");
    w = div.clientWidth;
    wh = Math.min(w, window.innerHeight * 0.9);
    renderer.setSize(wh, wh);
    div.appendChild(renderer.domElement);

    // https://www.redblobgames.com/making-of/draggable/
    el = renderer.domElement;
    el.addEventListener('pointerdown', handleMouseDown);
    el.addEventListener('pointerup', handleMouseUp);
    el.addEventListener('pointercancel', handleMouseUp);
    el.addEventListener('pointermove', handleMouseMove)
    el.addEventListener('touchstart', (e) => e.preventDefault());

    var worldTexture = THREE.ImageUtils.loadTexture('/assets/image/world1024x512.jpg');
    // without this, there is a line where the world wraps in the Pacific
    worldTexture.minFilter = THREE.NearestFilter;
    // need wrapping enabled
    worldTexture.wrapS = THREE.RepeatWrapping;
    worldTexture.wrapT = THREE.RepeatWrapping;
    uniforms = {
        texture1: { type: "t", value: worldTexture },
        phi1: { type: "f", value: 0.0 },
        lambda0: { type: "f", value: 0.0 }
    };
    var vertShader = getSourceSync("/assets/js/azeqproj_vs.glsl");
    var fragShader = getSourceSync("/assets/js/azeqproj_fs.glsl");

    var mapMaterial = new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: uniforms,
        vertexShader: vertShader,
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

    var lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
    var crossGeometry = new THREE.Geometry();
    var crossDelta = 0.02;
    crossGeometry.vertices.push(new THREE.Vector3(-crossDelta, 0, 0.1));
    crossGeometry.vertices.push(new THREE.Vector3(crossDelta, 0, 0.1));
    crossGeometry.vertices.push(new THREE.Vector3(0, -crossDelta, 0.1));
    crossGeometry.vertices.push(new THREE.Vector3(0, crossDelta, 0.1));
    var cross = new THREE.Line(crossGeometry, lineMaterial, THREE.LinePieces);
    scene.add(cross);

    // Equatorial Circumference of the earth = 40,075.017 km
    var COE = 40075.017;
    var circleStep = 5000;
    for (var km = circleStep; km < COE; km += circleStep) {
        var i = km / COE;
        var circleGeometry = new THREE.CircleGeometry(i, 100);
        circleGeometry.vertices.shift(); // pop off the circle center
        circleGeometry.vertices.verticesNeedUpdate;
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
