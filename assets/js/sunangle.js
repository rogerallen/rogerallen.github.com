if ( ! Detector.webgl ) Detector.addGetWebGLMessage({id:"placeholder"});

var scene;
var camera;
var controls;
var renderer;

function radians(d) { return d*Math.PI/180.0; }
function degrees(r) { return r*180.0/Math.PI; }
function sind(x) { return Math.sin(radians(x)); }
function cosd(x) { return Math.cos(radians(x)); }
function tand(x) { return Math.tan(radians(x)); }

function initScene(scene) {
    var viewerLat = radians(45.0);
    var viewerLon = radians(120.0);

    //----------------------------------------------------------------------
    var compassTexture  = new THREE.ImageUtils.loadTexture( '/assets/image/compass.png' );
    var compassMaterial = new THREE.MeshLambertMaterial({
        map: compassTexture,
        side: THREE.DoubleSide,
        transparent: true
    });
    var compassGeometry = new THREE.PlaneGeometry(.5, .5);
    compassGeometry.faceVertexUvs[0] = [];
    compassGeometry.faceVertexUvs[0].push([
        new THREE.Vector2(0, 1),
        new THREE.Vector2(0, 0),
        new THREE.Vector2(1, 1)
    ]);
    compassGeometry.faceVertexUvs[0].push([
        new THREE.Vector2(0, 0),
        new THREE.Vector2(1, 0),
        new THREE.Vector2(1, 1)
    ]);
    var compass = new THREE.Mesh(compassGeometry, compassMaterial);
    var compassMatrix = new THREE.Matrix4();
    var m1 = new THREE.Matrix4().makeTranslation(0,0,0.9999);
    var m2 = new THREE.Matrix4().makeRotationX(-viewerLat);
    compassMatrix.multiply(m2);
    compassMatrix.multiply(m1);
    compass.applyMatrix(compassMatrix);
    scene.add(compass);

    //----------------------------------------------------------------------
    var clockTexture  = new THREE.ImageUtils.loadTexture( '/assets/image/clock.png' );
    var clockMaterial = new THREE.MeshLambertMaterial({
        map: clockTexture,
        side: THREE.DoubleSide,
        transparent: true
    });
    var clockGeometry = new THREE.PlaneGeometry(.5, .5);
    clockGeometry.faceVertexUvs[0] = [];
    clockGeometry.faceVertexUvs[0].push([
        new THREE.Vector2(0, 1),
        new THREE.Vector2(0, 0),
        new THREE.Vector2(1, 1)
    ]);
    clockGeometry.faceVertexUvs[0].push([
        new THREE.Vector2(0, 0),
        new THREE.Vector2(1, 0),
        new THREE.Vector2(1, 1)
    ]);
    var clock = new THREE.Mesh(clockGeometry, clockMaterial);
    var clockMatrix = new THREE.Matrix4();
    var m1 = new THREE.Matrix4().makeTranslation(0,0,0.9999);
    var m2 = new THREE.Matrix4().makeRotationX(-viewerLat);
    var m3 = new THREE.Matrix4().makeRotationX(radians(120));
    clockMatrix.multiply(m2);
    clockMatrix.multiply(m1);
    clockMatrix.multiply(m3);
    clock.applyMatrix(clockMatrix);
    scene.add(clock);

    var earth = new THREE.Mesh(
        new THREE.SphereGeometry(1.0, 200, 200),
        new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture('/assets/image/world1024x512.jpg'),
        })
    );
    earth.rotation.y = radians(-90);
    scene.add(earth);

    light = new THREE.DirectionalLight( 0xeeeeee );
    light.position.set( 1, 1, 1 );
    scene.add( light );

    //light = new THREE.DirectionalLight( 0xffffee );
    //light.position.set( -1, -1, 1 );
    //scene.add( light );

    light = new THREE.AmbientLight( 0x444444 );
    scene.add( light );
}

function initCanvas() {
    var dim = [620,480];
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 15, dim[0] / dim[1], 0.1, 100 );

    controls = new THREE.TrackballControls( camera );
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [ 65, 83, 68 ]; // a, s, d ?
    controls.addEventListener( 'change', render );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(dim[0],dim[1]);
    div = document.getElementById("placeholder");
    div.appendChild(renderer.domElement);

    initScene(scene);

}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
}

function render() {
    renderer.render(scene, camera);
};

initCanvas();
animate();
// cause a controls change
camera.position.z = 10.0;
