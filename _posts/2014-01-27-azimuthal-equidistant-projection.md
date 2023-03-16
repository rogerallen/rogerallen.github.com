---
layout: post
category: webgl
tags: [webgl, opengl, 3d, shaders, maps, math]
---

<script src="/assets/js/three/three.min.65.js"></script>
<script src="/assets/js/three/Detector.js"></script>

The [_azimuthal equidistant map
projection_](http://en.wikipedia.org/wiki/Azimuthal_equidistant_projection)
creates a map that puts points equidistant from the map's center in a
circle surrounding it.  The most famous example is the [flag of the
United Nations](http://en.wikipedia.org/wiki/United_Nations_flag)
which centers at the north pole.  It is an interesting and complex
projection that in the past was mainly used to create line drawings.
Now, it can be done in realtime on a GPU in your web browser.

Click and drag in the image below to play with the projection.  See
what places on the world are equidistant from you.

<div id="placeholder"></div>

<p>This image is created via <a href="http://get.webgl.org/">WebGL</a> and
<a href="http://threejs.org/">three.js</a> with a texture-mapped quad.  Each
pixel in the quad runs a fragment shader that translates the incoming
texture coordinates <code>varying vec2 vUv</code> and looks up the map
color from a NASA world map.  Mouse events update the center of the
map ($\phi_1$ <code>uniform float phi1</code> and $\lambda_0$
<code>uniform float lambda0</code>) so you can interact with the map
dynamically.</p>

<p>The <code>vUv</code> input coordinates range $[0,1]$, but the
projection formula expects $x,y$ values centered at $(0,0)$ ranging
from $[-\pi,\pi]$, so we do a simple linear mapping to accomplish
this.  (Note that <code>TAU</code>$ = \tau = 2\pi$ )</p>

</p>

```
float x = TAU*(vUv.s - 0.5);
float y = TAU*(vUv.t - 0.5);
```

With x,y in the proper range, we implement the coordinate transform in
the fragment shader derived from the inverse formula at
[Mathworld](http://mathworld.wolfram.com/AzimuthalEquidistantProjection.html).
We use the inverse formula because we want to calculate a latitude and
longitude for indexing into the map texture.

<p>
$c = \sqrt {x^2 + y^2} \\
\phi = \sin^{-1}\left(\cos{c}\sin{\phi_1} + \frac{y \sin{c}\cos{\phi_1}}{c}\right) \\
\lambda = \lambda_0 + \tan^{-1}\left(\frac{x\sin{c}}{c\cos{\phi_1}\cos{c} - y\sin{\phi_1}\sin{c}}\right)$
</p>


```c
float c = sqrt(x*x + y*y);
float phi = asin( cos(c)*sin(phi1) + y*sin(c)*cos(phi1)/c );
float lambda = lambda0 +
    atan( x*sin(c), (c*cos(phi1)*cos(c) - y*sin(phi1)*sin(c)));
```

There is a special case that should be handled when $\lambda_0$ is
exactly $\pm\frac{\pi}{2}$, but those special cases do not seem
to cause any artifacts I can see, so I left them out.

After this calculation we need to get the texture lookup coordinates
remapped so $\lambda$ (longitude) maps $[-\pi,\pi]$ to $[0,1]$
while $\phi$ (latitude) maps from
$[-\frac{\pi}{2},\frac{\pi}{2}]$ to $[0,1]$.

```c
float s = (lambda/TAU) + 0.5; // -pi,pi -> 0,1
float t = (phi/PI) + 0.5;     // -pi/2,pi/2 -> 0,1
```

Finally we calculate the output color via texture lookup with a slight
tweak to "white-out" any pixel greater than $pi$ away from the center.
This creates a circle that completes the map.

```c
gl_FragColor = texture2D(texture1, vec2(s,t)) +
    vec4(smoothstep(PI-.05,PI,c));
```

Note that the texture needs to _repeat_ because the s,t texture
coordinates are not constrained to $[0,1]$ and the repeat fills in the
pixel values properly.

I hope this has explained how you can get some interesting realtime
cartographic projections from a fragment shader.  Enclosed below, you
can see the full code for creating the effect.

###The Fragment Shader

```c
#ifdef GL_ES
precision highp float;
#endif

#define PI  3.1415926535897931
#define TAU 6.2831853071795862

varying vec2 vUv;
uniform sampler2D texture1;

// phi1 = latitude, lambda0 = longitude of the center of the map
uniform float phi1;
uniform float lambda0;

void main(void) {
    float x = TAU*(vUv.s - 0.5);
    float y = TAU*(vUv.t - 0.5);

    float c = sqrt(x*x + y*y);
    float phi = asin( cos(c)*sin(phi1) + y*sin(c)*cos(phi1)/c );
    float lambda = lambda0 +
        atan( x*sin(c), (c*cos(phi1)*cos(c) - y*sin(phi1)*sin(c)));

    float s = (lambda/TAU) + 0.5; // -pi,pi -> 0,1
    float t = (phi/PI) + 0.5;     // -pi/2,pi/2 -> 0,1

    gl_FragColor = texture2D(texture1, vec2(s,t)) +
        vec4(smoothstep(PI-.05,PI,c));
}
```

###The Javascript

```javascript
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

    curLatitude += deltaY / 100.0;
    curLongitude -= deltaX / 100.0;

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
```

<script src="/assets/js/azeqproj.js"></script>
