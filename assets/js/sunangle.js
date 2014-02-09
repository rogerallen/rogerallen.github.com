if ( ! Detector.webgl ) Detector.addGetWebGLMessage({id:"placeholder"});

var scene;
var camera;
var controls;
var renderer;
var viewer;

function radians(d) { return d*Math.PI/180.0; }
function degrees(r) { return r*180.0/Math.PI; }
function sind(x) { return Math.sin(radians(x)); }
function cosd(x) { return Math.cos(radians(x)); }
function tand(x) { return Math.tan(radians(x)); }

// given x in domain [x0,x1], return y in range [y0,y1]
function linlin(x0,x1,y0,y1,x) {
    var norm_x = (x-x0)/(x1-x0);
    var y = y0 + (y1-y0)*norm_x;
    return y
}

// ======================================================================
function Observer(lat,lon) {
    this.lat     = lat;
    this.lon     = lon;
    this.compass = null;
    this.clock   = null;
    this.clockB  = null;
}
Observer.prototype = {
    positionObserver: function() {
        // go back to the original position
        this.compass.applyMatrix(new THREE.Matrix4().getInverse(this.compass.matrix));
        this.clock.applyMatrix(new THREE.Matrix4().getInverse(this.clock.matrix));
        this.clockB.applyMatrix(new THREE.Matrix4().getInverse(this.clockB.matrix));

        var compassMatrix = new THREE.Matrix4();
        var mtrans        = new THREE.Matrix4().makeTranslation(0,0,0.998);
        var mlat          = new THREE.Matrix4().makeRotationX(-this.lat);
        var mlon          = new THREE.Matrix4().makeRotationY(-this.lon);
        compassMatrix.multiply(mlon);
        compassMatrix.multiply(mlat);
        compassMatrix.multiply(mtrans);
        this.compass.applyMatrix(compassMatrix);

        var clockMatrix = new THREE.Matrix4();
        var msunalt     = new THREE.Matrix4().makeRotationX(radians(120));
        clockMatrix.multiply(mlon);
        clockMatrix.multiply(mlat);
        clockMatrix.multiply(mtrans);
        clockMatrix.multiply(msunalt);
        this.clock.applyMatrix(clockMatrix);

        // turn around 180 degrees to face opposite the main clock.
        var clockBMatrix = new THREE.Matrix4();
        var myflip       = new THREE.Matrix4().makeRotationY(radians(180));
        clockBMatrix.multiply(mlon);
        clockBMatrix.multiply(mlat);
        clockBMatrix.multiply(mtrans);
        clockBMatrix.multiply(msunalt);
        clockBMatrix.multiply(myflip);
        this.clockB.applyMatrix(clockBMatrix);
    },
    addUvs: function(geom) {
        geom.faceVertexUvs[0] = [];
        geom.faceVertexUvs[0].push([
            new THREE.Vector2(0, 1),
            new THREE.Vector2(0, 0),
            new THREE.Vector2(1, 1)
        ]);
        geom.faceVertexUvs[0].push([
            new THREE.Vector2(0, 0),
            new THREE.Vector2(1, 0),
            new THREE.Vector2(1, 1)
        ]);
        return geom;
    },
    initGeometry: function(scene) {
        //----------------------------------------------------------------------
        var compassGeometry = new THREE.PlaneGeometry(.5, .5);
        compassGeometry = this.addUvs(compassGeometry)
        this.compass = new THREE.Mesh(
            compassGeometry,
            new THREE.MeshLambertMaterial({
                map: new THREE.ImageUtils.loadTexture('/assets/image/compass.png'),
                side: THREE.DoubleSide,
                transparent: true
            })
        );

        //----------------------------------------------------------------------
        // the clocks are not double-sided.  this clock faces "south"
        var clockGeometry = new THREE.PlaneGeometry(.5, .5);
        clockGeometry = this.addUvs(clockGeometry)
        this.clock = new THREE.Mesh(
            clockGeometry,
            new THREE.MeshLambertMaterial({
                map: new THREE.ImageUtils.loadTexture('/assets/image/clock.png'),
                transparent: true
                //depthWrite: false
            }));

        //----------------------------------------------------------------------
        // this clock faces "north"
        var clockBGeometry = new THREE.PlaneGeometry(.5, .5);
        clockBGeometry = this.addUvs(clockBGeometry)
        this.clockB = new THREE.Mesh(
            clockBGeometry,
            new THREE.MeshLambertMaterial({
                map: new THREE.ImageUtils.loadTexture('/assets/image/clock.png'),
                transparent: true
                //depthWrite: false
            }));

        this.positionObserver();

        scene.add(this.compass);
        scene.add(this.clock);
        scene.add(this.clockB);

    }
};

// ======================================================================
function initScene(scene) {
    viewer = new Observer(radians(52.0), radians(0.0));

    var earth = new THREE.Mesh(
        new THREE.SphereGeometry(1.0, 200, 200),
        new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture('/assets/image/world1024x512.jpg'),
        })
    );
    earth.rotation.y = radians(-90);

    scene.add(earth);
    viewer.initGeometry(scene)

    var light = new THREE.DirectionalLight( 0xeeeeee );
    light.position.set( 1, 0, 1 );
    scene.add( light );

    light = new THREE.DirectionalLight( 0xeeeeee );
    light.position.set( -1, 0, -1 );
    scene.add( light );

    light = new THREE.AmbientLight( 0x444444 );
    scene.add( light );
}

function initCanvas() {
    var dim = [620,480];
    var div = document.getElementById("placeholder");
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 15, dim[0] / dim[1], 0.1, 100 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(dim[0],dim[1]);
    // transparency requires we sort things ourselves
    renderer.sortObjects = false;
    div.appendChild(renderer.domElement);

    initScene(scene);

    controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.rotateSpeed = 1.2;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [ 65, 83, 68 ]; // a, s, d ?
    controls.addEventListener( 'change', render );

    var lath = document.getElementById("slider-lat-handle");
    var lonh = document.getElementById("slider-lon-handle");
    var minlat =  -90.0;
    var maxlat =   90.0;
    var minlon = -180.0;
    var maxlon =  180.0;
    var latdrag = new Dragdealer('slider-lat',{
        x: linlin(minlat, maxlat, 0.0, 1.0, degrees(viewer.lat)),
        slide: false,
        animationCallback: function(x,y) {
            viewer.lat = radians(linlin(0.0, 1.0, minlat, maxlat, x));
            lath.innerHTML = sprintf("lat=%.2f",degrees(viewer.lat));
            viewer.positionObserver();
            render();
        }
    });
    var londrag = new Dragdealer('slider-lon',{
        x: linlin(minlon, maxlon, 0.0, 1.0, degrees(viewer.lon)),
        slide: false,
        animationCallback: function(x,y) {
            viewer.lon = radians(linlin(0.0, 1.0, minlon, maxlon, x));
            lonh.innerHTML = sprintf("lon=%.0f",degrees(viewer.lon));
            viewer.positionObserver();
            render();
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
}

function render() {
    renderer.render(scene, camera);
}

initCanvas();
// cause a controls change
camera.position.z = 10.0;
animate();
render();
