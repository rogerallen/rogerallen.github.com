if ( ! Detector.webgl ) Detector.addGetWebGLMessage({id:"placeholder"});

var scene;
var camera;
var controls;
var renderer;

function initScene(scene) {
    var mapTexture  = new THREE.ImageUtils.loadTexture( '/assets/image/world1024x512.jpg' );
    var mapMaterial = new THREE.MeshLambertMaterial( { map: mapTexture, side: THREE.DoubleSide } );
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

    light = new THREE.DirectionalLight( 0xffffaa );
    light.position.set( 1, 1, 1 );
    scene.add( light );

    light = new THREE.DirectionalLight( 0xffffaa );
    light.position.set( -1, -1, 1 );
    scene.add( light );

    light = new THREE.AmbientLight( 0x884422 );
    scene.add( light );
}

function initCanvas() {
    var dim = [620,480];
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );

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
camera.position.z = 5;
