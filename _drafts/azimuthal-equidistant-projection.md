---
layout: post
category: 3d
tags: [3d, maps, math]
---

<script src="https://rawgithub.com/mrdoob/three.js/master/build/three.js"></script>

Testing text.

<div id="placeholder"></div>

And text that follows.

<script id="vertexShader" type="x-shader/x-vertex">
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix *
                       modelViewMatrix *
                      vec4(position,1.0);
    }
</script>

<script id="fragmentShader" type="x-shader/x-fragment">
  #ifdef GL_ES
  precision highp float;
  #endif

  #define PI 3.1415926535897931
  #define PI2 6.2831853071795862
  varying vec2 vUv;
  uniform sampler2D texture1;

  // phi = lat, lambda = long
  // the center of the map
  uniform float phi1;
  uniform float lambda0;

  void main(void) {
    // We want a map that goes all around the earth
    // 0,1 -> -pi,pi
    float x = PI2*(vUv.s - 0.5);
    float y = PI2*(vUv.t - 0.5);

    // from http://mathworld.wolfram.com/AzimuthalEquidistantProjection.html
    float c = sqrt(x*x + y*y);
    float phi = asin( cos(c)*sin(phi1) + y*sin(c)*cos(phi1)/c );
    float lambda = lambda0 +
            atan( x*sin(c), (c*cos(phi1)*cos(c) - y*sin(phi1)*sin(c)));
    // FIXME for lambda0 == [90,-90]

    // Here we want longitude to wrap all around: -pi,pi -> 0,1
    // But latitude works slightly different: -pi/2,pi/2 -> 0,1
    vec2 tc = vec2( (lambda/PI2) + 0.5, (phi/PI) + 0.5);

    gl_FragColor = texture2D(texture1, tc);
    // anything greater than PI away is wrapping again
    gl_FragColor = gl_FragColor + vec4(smoothstep(PI-.05,PI,c));
  }
</script>

<script>
    // FIXME if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    var dim = 512;
    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-1, 1, -1, 1, -1, 1);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(dim,dim); // seems to fit the blog nicely
    div = document.getElementById("placeholder");
    div.appendChild(renderer.domElement);

    var worldTexture = THREE.ImageUtils.loadTexture('/assets/image/world512x256.jpg');
    //var worldTexture = THREE.ImageUtils.loadTexture('/assets/image/world1024x512.jpg');
    //worldTexture.magFilter = THREE.NearestFilter;
    worldTexture.minFilter = THREE.NearestFilter; // without this, there is a line where the world wraps
    var uniforms = {
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

    var render = function () {
    	requestAnimationFrame(render);

    	renderer.render(scene, camera);
    };

    render();
</script>
