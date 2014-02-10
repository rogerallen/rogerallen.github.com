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

// INT in Meeus' book always rounds towards negative infinity
// so does Math.floor, cool.
function INT(x) { return Math.floor(x) }

// http://stackoverflow.com/questions/6356164/simple-javascript-date-math-not-really
function offsetDate(date, days) {
    var tmpDate = new Date(date);
    tmpDate.setDate(tmpDate.getDate() + days)
    return tmpDate;
};

// ======================================================================
// Ephemeris code derived from 'Astronomical Algorithms' by Jean
// Meeus, 1991
function SunPos(lat,lon,date) {
    this.lat     = lat;  // observer_latitude (degrees)
    this.lon     = lon;  // observer_longitude (degrees)
    this.date    = date; // new Date();
    console.log("SunPos"+date);
    this.sun_ras = 0;    // right_ascension (degrees) angle from
                         // vernal equinox point on celestial equator
    this.sun_dec = 0;    // declination (degrees) angle from R.A. on
                         // celestial equator
    this.sun_alt = 0;    // altitude (degrees) angle from azi pt on
                         // horizon towards zenith
    this.sun_azi = 0;    // azimuth (degrees) angle from North on
                         // observer horizon
    this.JD      = 0;    // Julian Date
    this.T       = 0;    // ?FIXME name?
    this.Theta0  = 0;    // sidereal time at Greenwich (in degrees)
    this.xyz     = null; // alt/az -> x,y,z
    this.compute();
}
SunPos.prototype = {
    updateLatLon: function(newlat,newlon) {
        this.lat = newlat;
        this.lon = newlon;
        this.computeSun();
    },
    updateDate: function(newdate) {
        //console.log("updateDate"+newdate);
        this.date = newdate;
        this.compute();
    },
    computeJulianDay: function() {
        var year        = this.date.getUTCFullYear();
        var month       = this.date.getUTCMonth();
        var day         = this.date.getUTCDate(); // ! not Day
        var part_of_day = (this.date.getUTCHours()/24.0 +
                           this.date.getUTCMinutes()/(24.0*60.0) +
                           this.date.getUTCSeconds()/(24.0*60.0*60.0) +
                           this.date.getUTCMilliseconds()/(24.0*60.0*60.0*1000.0));
        day += part_of_day;
        // Take current YMD & get the Julian Day.  See Formula 7.1
        if(month <= 2) {
            year = year - 1;
            month = month + 12;
        }
        var A = INT(year/100.);
        var B = 2 - A + INT(A/4.);
        if((year + month/12. + day/(12*31)) < (1582 + 10./12. + 5/(12*31))) {
            // Julian Calendar
            B = 0;
        }
        this.JD = INT(365.25*(year+4716.)) + INT(30.6001*(month+1.)) + day + B - 1524.5
    },
    computeDate: function() {
        // compute this.JD, T and Theta0
        this.computeJulianDay();
        this.T  = (this.JD - 2451545.0) / 36525.0;
        var T = this.T;
        // sidereal time at Greenwich (in degrees)
        this.Theta0 = (280.46061837 + 360.98564736629*(this.JD-2451545.0) +
                       0.000387933*T*T - T*T*T/38710000.0);
    },

    computeSunRaDec: function() {
        // compute the RA/Dec position of the sun. See Chapter 24.
        var JD             = this.JD;
        var T              = this.T;
        var L0             = 280.46645 + 36000.76983*T + 0.0003032*T*T;
        var M              = 357.52910 + 35999.05030*T + 0.0001559*T*T - 0.00000048*T*T*T;
        var e              = 0.016708617 - 0.000042037*T + 0.0000001236*T*T;
        var C              = ((1.914600 - 0.004817*T - 0.000014*T*T)*sind(M) +
                              (0.019993 - 0.000101*T)*sind(2*M) + 0.000290*sind(3*M));
        var Theta          = L0 + C;
        var v              = M + C;
        var R              = 1.000001018*(1 - e*e) / (1 + e*cosd(v));
        var Omega          = 125.04 - 1934.136*T;
        var Lambda         = Theta - 0.00569 - 0.00478*sind(Omega);
        var epsilon        = (23.0 + 26./60. + 21.448/(60.*60.) - 46.8150*T/(60.*60.) -
                              0.00059*T*T/(60.*60.) + 0.001813*T*T*T/(60.*60.));
        // R.A. is alpha, Declination is delta
        var alpha_apparent = degrees(Math.atan2(cosd(epsilon) * sind(Lambda),
                                                cosd(Lambda)))
        var delta_apparent = degrees(Math.asin(sind(epsilon) * sind(Lambda)))
        this.sun_ras = alpha_apparent
        this.sun_dec = delta_apparent
    },
    computeSunAltAz: function() {
        // compute the altitude & azimuth (from North).  See Chapter 12.
        // NOTE longitude is opposite sign than the book!
        var H        = this.Theta0 + this.lon - this.sun_ras;
        var delta    = this.sun_dec;
        var phi      = this.lat;
        // A is azimuth (from north, not as book has it), h is altitude
        var A        = degrees(Math.atan2(sind(H),
                                          cosd(H)*sind(phi) - tand(delta)*cosd(phi))) + 180.;
        var h        = degrees(Math.asin(sind(phi)*sind(delta) + cosd(phi)*cosd(delta)*cosd(H)));
        this.sun_azi = A;
        this.sun_alt = h;
    },
    computeXYZ: function() {
        // translate alt-az coordinates to x,y,z
        // * altitude is elevation from the plane.
        //   phi is inclination from the positive Z axis
        // * azimuth is 0 at y axis & increments clockwise.
        //   theta is measured from x axis so y axis has phi = +90 & counter-clockwise incr.
        var alt   = radians(this.sun_alt);
        var az    = radians(this.sun_azi);
        var phi   = Math.PI/2 - alt;
        var azrev = 2*Math.PI - az;
        var theta = Math.PI/2 + azrev;
        if(theta > 2*Math.PI) {
            theta -= 2*Math.PI;
        }
        // translate r, theta, phi in radians to x,y,z.
        var r = 0.707;
        var x = r * Math.cos(theta) * Math.sin(phi)
        var y = r * Math.sin(theta) * Math.sin(phi)
        var z = r * Math.cos(phi)
        this.xyz = new THREE.Vector3(x, y, z);

    },
    computeSun: function() {
        this.computeSunRaDec();
        this.computeSunAltAz();
        this.computeXYZ();
    },
    compute: function() {
        this.computeDate();
        this.computeSun();
    }
};

function Observer(lat,lon,date) {
    this.lat    = lat;  // observer_latitude (degrees)
    this.lon    = lon;  // observer_longitude (degrees)
    this.date   = date; // new Date();
    this.sunpos = new SunPos(lat, lon, date);
    var y = this.date.getUTCFullYear();
    var m = this.date.getUTCMonth();
    var d = this.date.getUTCDate();
    // derive the angles of the corners of the clock quad for this day
    this.qpos = [new SunPos(lat, lon, new Date(y, m, d,  3, 0, 0, 0.0)),
                 new SunPos(lat, lon, new Date(y, m, d,  9, 0, 0, 0.0)),
                 new SunPos(lat, lon, new Date(y, m, d, 15, 0, 0, 0.0)),
                 new SunPos(lat, lon, new Date(y, m, d, 21, 0, 0, 0.0))];

    // FIXME?  split off into ObserverViewer?
    this.compass = null;
    this.clock   = null;
    this.clockB  = null;
}
Observer.prototype = {
    updateLatLon: function(newlat,newlon) {
        this.lat = newlat;
        this.lon = newlon;
        this.sunpos.updateLatLon(newlat,newlon);
        this.qpos[0].updateLatLon(newlat,newlon);
        this.qpos[1].updateLatLon(newlat,newlon);
        this.qpos[2].updateLatLon(newlat,newlon);
        this.qpos[3].updateLatLon(newlat,newlon);
        this.updateClockGeom();
        this.positionObserver();
    },
    updateDate: function(newdate) {
        //console.log("updateDate"+newdate);
        this.date = newdate;
        this.sunpos.updateDate(newdate);
        var y = this.date.getUTCFullYear();
        var m = this.date.getUTCMonth();
        var d = this.date.getUTCDate();
        this.qpos[0].updateDate(new Date(y, m, d,  3, 0, 0, 0.0));
        this.qpos[1].updateDate(new Date(y, m, d,  9, 0, 0, 0.0));
        this.qpos[2].updateDate(new Date(y, m, d, 15, 0, 0, 0.0));
        this.qpos[3].updateDate(new Date(y, m, d, 21, 0, 0, 0.0));
        this.updateClockGeom();
        this.positionObserver();
    },
    positionObserver: function() {
        // go back to the original position
        this.compass.applyMatrix(new THREE.Matrix4().getInverse(this.compass.matrix));
        this.clock.applyMatrix(new THREE.Matrix4().getInverse(this.clock.matrix));
        this.clockB.applyMatrix(new THREE.Matrix4().getInverse(this.clockB.matrix));

        var compassMatrix = new THREE.Matrix4();
        var mtrans        = new THREE.Matrix4().makeTranslation(0,0,0.998);
        var mlat          = new THREE.Matrix4().makeRotationX(-radians(this.lat));
        var mlon          = new THREE.Matrix4().makeRotationY(-radians(this.lon));
        //compassMatrix.multiply(mlon);
        //compassMatrix.multiply(mlat);
        //compassMatrix.multiply(mtrans);
        this.compass.applyMatrix(compassMatrix);

        var clockMatrix = new THREE.Matrix4();
        var msun_alt     = new THREE.Matrix4().makeRotationX(radians(this.sunpos.sun_alt));
        //clockMatrix.multiply(mlon);
        //clockMatrix.multiply(mlat);
        //clockMatrix.multiply(mtrans);
        //xclockMatrix.multiply(msun_alt);
        this.clock.applyMatrix(clockMatrix);

        // turn around 180 degrees to face opposite the main clock.
        var clockBMatrix = new THREE.Matrix4();
        var myflip       = new THREE.Matrix4().makeRotationY(radians(180));
        //clockBMatrix.multiply(mlon);
        //clockBMatrix.multiply(mlat);
        //clockBMatrix.multiply(mtrans);
        //xclockBMatrix.multiply(msun_alt);
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
        var compassGeometry = new THREE.PlaneGeometry(1.0, 1.0);
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
        this.clock.geometry.dynamic = true;

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
        this.clockB.geometry.dynamic = true;

        this.updateClockGeom();

        this.positionObserver();

        scene.add(this.compass);
        scene.add(this.clock);
        //scene.add(this.clockB);

    },
    updateClockGeom: function() {
        // viewer.clock.geometry.vertices
        // geom verts: 0,1; 1,1; 0,0; 1,0 = 21, 3, 15, 9
        viewer.clock.geometry.vertices = [
            this.qpos[3].xyz,
            this.qpos[0].xyz,
            this.qpos[2].xyz,
            this.qpos[1].xyz
            ];
        viewer.clock.geometry.verticesNeedUpdate = true;
        viewer.clock.geometry.normalsNeedUpdate = true;
        viewer.clockB.geometry.vertices = [
            this.qpos[3].xyz,
            this.qpos[0].xyz,
            this.qpos[2].xyz,
            this.qpos[1].xyz
            ];
        viewer.clockB.geometry.verticesNeedUpdate = true;
        viewer.clockB.geometry.normalsNeedUpdate = true;
    }
};

// ======================================================================
function initScene(scene) {
    viewer = new Observer(40.0, 0.0, new Date());

    var earth = new THREE.Mesh(
        new THREE.SphereGeometry(1.0, 200, 200),
        new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture('/assets/image/world1024x512.jpg'),
        })
    );
    earth.rotation.y = radians(-90);

    //scene.add(earth);
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

    // FIXME -- add resize handler to adjust the boundaries
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
    var dayh = document.getElementById("slider-day-handle");
    var minlat =  -90.0;
    var maxlat =   90.0;
    var minlon = -180.0;
    var maxlon =  180.0;
    var minday = -365/2;
    var maxday =  365/2;
    var latdrag = new Dragdealer('slider-lat',{
        x: linlin(minlat, maxlat, 0.0, 1.0, viewer.lat),
        slide: false,
        animationCallback: function(x,y) {
            viewer.updateLatLon(linlin(0.0, 1.0, minlat, maxlat, x),
                                viewer.lon);
            lath.innerHTML = sprintf("lat=%.2f", viewer.lat);
            render();
        }
    });
    var londrag = new Dragdealer('slider-lon',{
        x: linlin(minlon, maxlon, 0.0, 1.0, viewer.lon),
        slide: false,
        animationCallback: function(x,y) {
            viewer.updateLatLon(viewer.lat,
                                linlin(0.0, 1.0, minlon, maxlon, x));
            lonh.innerHTML = sprintf("lon=%.0f",viewer.lon);
            render();
        }
    });
    var today = new Date();
    var daydrag = new Dragdealer('slider-day',{
        x: linlin(minday, maxday, 0.0, 1.0, 0.0),
        slide: false,
        animationCallback: function(x,y) {
            var offset = linlin(0.0, 1.0, minday, maxday, x);
            var offset = Math.floor(offset);
            var offset_date = offsetDate(today, offset)
            viewer.updateDate(offset_date);
            dayh.innerHTML = sprintf("day=%.0f", offset);
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
animate();
// FIXME -- how can we get this to always work?
// cause a controls change
camera.position.z = -4.0;
