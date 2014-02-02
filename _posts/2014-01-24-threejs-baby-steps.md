---
layout: post
category: webgl
tags: [webgl, opengl, 3d, three.js, shaders, maps, math]
---

<script src="/assets/js/three.min.65.js"></script>

I'm porting my [Azimuthal equidistant projection
code](http://www.rogerandwendy.com/roger/azeq/index.html) to use
[three.js](http://threejs.org/).  To do this, I took an incremental
approach and thought I'd share my first steps to getting a fragment
shader displaying a simple textured quad to work.

<div id="placeholder1"></div>

The above quad was created by the code below.  It just illustrates
drawing a single textured quad with an orthographic projection using
default WebGL with no shaders.

*If you do not see a world map above, your browser does not support WebGL
and you should remedy that situation immediately.*

```javascript
var dim1 = 256;
var scene1 = new THREE.Scene();
var camera1 = new THREE.OrthographicCamera(-1, 1, -1, 1, -1, 1);
camera1.position.z = 1;
var renderer1 = new THREE.WebGLRenderer();
renderer1.setSize(dim1,dim1);
div1 = document.getElementById("placeholder1");
div1.appendChild(renderer1.domElement);

var mapTexture1  = new THREE.ImageUtils.loadTexture( '/assets/image/world512x256.jpg' );
var mapMaterial1 = new THREE.MeshBasicMaterial( { map: mapTexture1, side: THREE.DoubleSide } );
var mapGeometry1 = new THREE.PlaneGeometry(2, 2, 1, 1);
mapGeometry1.faceVertexUvs[0] = [];
mapGeometry1.faceVertexUvs[0].push([
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0, 1),
    new THREE.Vector2(1, 0)
    ]);
mapGeometry1.faceVertexUvs[0].push([
    new THREE.Vector2(0, 1),
    new THREE.Vector2(1, 1),
    new THREE.Vector2(1, 0)
  ]);
var map1 = new THREE.Mesh(mapGeometry1, mapMaterial1);
scene1.add(map1);

var render1 = function () {
    requestAnimationFrame(render1);
    renderer1.render(scene1, camera1);
};

render1();
```

<script>
    var dim1 = 256;
    var scene1 = new THREE.Scene();
    var camera1 = new THREE.OrthographicCamera(-1, 1, -1, 1, -1, 1);
    camera1.position.z = 1;
    var renderer1 = new THREE.WebGLRenderer();
    renderer1.setSize(dim1,dim1);
    div1 = document.getElementById("placeholder1");
    div1.appendChild(renderer1.domElement);

    var mapTexture1  = new THREE.ImageUtils.loadTexture( '/assets/image/world512x256.jpg' );
    var mapMaterial1 = new THREE.MeshBasicMaterial( { map: mapTexture1, side: THREE.DoubleSide } );
    var mapGeometry1 = new THREE.PlaneGeometry(2, 2, 1, 1);
    mapGeometry1.faceVertexUvs[0] = [];
    mapGeometry1.faceVertexUvs[0].push([
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, 1),
        new THREE.Vector2(1, 0)
        ]);
    mapGeometry1.faceVertexUvs[0].push([
        new THREE.Vector2(0, 1),
        new THREE.Vector2(1, 1),
        new THREE.Vector2(1, 0)
      ]);
    var map1 = new THREE.Mesh(mapGeometry1, mapMaterial1);
    scene1.add(map1);

    var render1 = function () {
        requestAnimationFrame(render1);
        renderer1.render(scene1, camera1);
    };

    render1();
</script>

I need to add a vertex & fragment shader in order to port my code.
The following example illustrates how to minimally change the code in
order to accomplish this.

<div id="placeholder2"></div>

Here is the basic vertex shader that emulates the OpenGL default
shader for a model-view-projection transformation.  In addition, it
passes the uv coordinates for the texture lookup.

```glsl
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix *
                  modelViewMatrix *
                  vec4(position,1.0);
}
```

<script id="vertexShader" type="x-shader/x-vertex">
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix *
                      modelViewMatrix *
                      vec4(position,1.0);
    }
</script>

The fragment shader is simply doing the texture lookup.

```glsl
uniform sampler2D texture1;
varying vec2      vUv;
void main() {
    gl_FragColor = texture2D(texture1, vUv);
}
```

<script id="fragmentShader" type="x-shader/x-fragment">
    uniform sampler2D texture1;
    varying vec2      vUv;
    void main() {
        gl_FragColor = texture2D(texture1, vUv);
    }
</script>

And, finally the javascript to make it all work.  While this code is
straightforward in the end.  I will admit that I got the dreaded "black
screen" for quite a while because I skipped over this setting:
`ShaderMaterial.side = THREE.DoubleSide`.  Without this, the
PlaneGeometry is just back-face culled and nothing is drawn.

Oh, the joys of debugging OpenGL code.

```javascript
var dim2 = 256;
var scene2 = new THREE.Scene();
var camera2 = new THREE.OrthographicCamera(-1, 1, -1, 1, -1, 1);

var renderer2 = new THREE.WebGLRenderer();
renderer2.setSize(dim2,dim2);
div2 = document.getElementById("placeholder2");
div2.appendChild(renderer2.domElement);

var uniforms2 = {
    texture1: { type: "t",
                value: THREE.ImageUtils.loadTexture('/assets/image/world512x256.jpg')
    }
};
var vertShader2 = document.getElementById('vertexShader').innerHTML;
var fragShader2 = document.getElementById('fragmentShader').innerHTML;

var mapMaterial2 = new THREE.ShaderMaterial({
    side:           THREE.DoubleSide,  // very important!
    uniforms:       uniforms2,
    vertexShader:   vertShader2,
    fragmentShader: fragShader2
});

var mapGeometry2 = new THREE.PlaneGeometry(2, 2);
mapGeometry2.faceVertexUvs[0] = [];
mapGeometry2.faceVertexUvs[0].push([
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0, 1),
    new THREE.Vector2(1, 0)
    ]);
mapGeometry2.faceVertexUvs[0].push([
    new THREE.Vector2(0, 1),
    new THREE.Vector2(1, 1),
    new THREE.Vector2(1, 0)
  ]);
var map2 = new THREE.Mesh(mapGeometry2, mapMaterial2);
scene2.add(map2);

var render2 = function () {
    requestAnimationFrame(render2);
    renderer2.render(scene2, camera2);
};

render2();
```

<script>
    var dim2 = 256;
    var scene2 = new THREE.Scene();
    var camera2 = new THREE.OrthographicCamera(-1, 1, -1, 1, -1, 1);

    var renderer2 = new THREE.WebGLRenderer();
    renderer2.setSize(dim2,dim2);
    div2 = document.getElementById("placeholder2");
    div2.appendChild(renderer2.domElement);

    var uniforms2 = {
        texture1: { type: "t",
                    value: THREE.ImageUtils.loadTexture('/assets/image/world512x256.jpg')
        }
    };
    var vertShader2 = document.getElementById('vertexShader').innerHTML;
    var fragShader2 = document.getElementById('fragmentShader').innerHTML;

    var mapMaterial2 = new THREE.ShaderMaterial({
        side:           THREE.DoubleSide,  // very important!
        uniforms:       uniforms2,
        vertexShader:   vertShader2,
        fragmentShader: fragShader2
    });

    var mapGeometry2 = new THREE.PlaneGeometry(2, 2);
    mapGeometry2.faceVertexUvs[0] = [];
    mapGeometry2.faceVertexUvs[0].push([
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, 1),
        new THREE.Vector2(1, 0)
        ]);
    mapGeometry2.faceVertexUvs[0].push([
        new THREE.Vector2(0, 1),
        new THREE.Vector2(1, 1),
        new THREE.Vector2(1, 0)
      ]);
    var map2 = new THREE.Mesh(mapGeometry2, mapMaterial2);
    scene2.add(map2);

    var render2 = function () {
        requestAnimationFrame(render2);
        renderer2.render(scene2, camera2);
    };

    render2();
</script>

Displaying a simple image is pretty boring.  Let's liven it up
just a little bit.  How would we add some animation?

<div id="placeholder3"></div>

The fragment shader offsets the texture coordinates as a function of
time.  It also messes with the colors, just for fun.

```glsl
uniform float     time;
uniform sampler2D texture1;
varying vec2      vUv;
void main() {
    float k = 0.2;
    vec2 uv = vec2(k*cos(time), k*sin(time)) + vUv;
    vec4 c = texture2D(texture1, uv);
    vec4 d = vec4(0.0);
    d.r = mix(c.r,c.b,smoothstep(-0.5, 0.5, sin(time)));
    d.g = mix(c.g,c.r,smoothstep(-0.5, 0.5, cos(time)));
    d.b = mix(c.b,c.g,smoothstep(-0.5, 0.5, cos(time)));
    gl_FragColor = d;
}
```
<script id="fragmentShader3" type="x-shader/x-fragment">
    uniform float     time;
    uniform sampler2D texture1;
    varying vec2      vUv;
    void main() {
        float k = 0.2;
        vec2 uv = vec2(k*cos(time), k*sin(time)) + vUv;
        vec4 c = texture2D(texture1, uv);
        vec4 d = vec4(0.0);
        d.r = mix(c.r,c.b,smoothstep(-0.5, 0.5, sin(time)));
        d.g = mix(c.g,c.r,smoothstep(-0.5, 0.5, cos(time)));
        d.b = mix(c.b,c.g,smoothstep(-0.5, 0.5, cos(time)));
        gl_FragColor = d;
    }
</script>

And the full javascript just adds a simple increment of a uniform time
value whenever a frame is rendered.

```javascript
var dim3 = 256;
var scene3 = new THREE.Scene();
var camera3 = new THREE.OrthographicCamera(-1, 1, -1, 1, -1, 1);

var renderer3 = new THREE.WebGLRenderer();
renderer3.setSize(dim3,dim3);
div3 = document.getElementById("placeholder3");
div3.appendChild(renderer3.domElement);

var uniforms3 = {
    time:     { type: "f", value: 0.0 },
    texture1: { type: "t",
                value: THREE.ImageUtils.loadTexture('/assets/image/world512x256.jpg')
    }
};
var vertShader3 = document.getElementById('vertexShader').innerHTML;
var fragShader3 = document.getElementById('fragmentShader3').innerHTML;

var mapMaterial3 = new THREE.ShaderMaterial({
    side:           THREE.DoubleSide,  // very important!
    uniforms:       uniforms3,
    vertexShader:   vertShader3,
    fragmentShader: fragShader3
});

var mapGeometry3 = new THREE.PlaneGeometry(2, 2);
mapGeometry3.faceVertexUvs[0] = [];
mapGeometry3.faceVertexUvs[0].push([
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0, 1),
    new THREE.Vector2(1, 0)
    ]);
mapGeometry3.faceVertexUvs[0].push([
    new THREE.Vector2(0, 1),
    new THREE.Vector2(1, 1),
    new THREE.Vector2(1, 0)
  ]);
var map3 = new THREE.Mesh(mapGeometry3, mapMaterial3);
scene3.add(map3);

var render3 = function () {
    requestAnimationFrame(render3);
    uniforms3.time.value += 1.0/30.0;
    renderer3.render(scene3, camera3);
};

render3();
```

<script>
    var dim3 = 256;
    var scene3 = new THREE.Scene();
    var camera3 = new THREE.OrthographicCamera(-1, 1, -1, 1, -1, 1);

    var renderer3 = new THREE.WebGLRenderer();
    renderer3.setSize(dim3,dim3);
    div3 = document.getElementById("placeholder3");
    div3.appendChild(renderer3.domElement);

    var uniforms3 = {
        time:     { type: "f", value: 0.0 },
        texture1: { type: "t",
                    value: THREE.ImageUtils.loadTexture('/assets/image/world512x256.jpg')
        }
    };
    var vertShader3 = document.getElementById('vertexShader').innerHTML;
    var fragShader3 = document.getElementById('fragmentShader3').innerHTML;

    var mapMaterial3 = new THREE.ShaderMaterial({
        side:           THREE.DoubleSide,  // very important!
        uniforms:       uniforms3,
        vertexShader:   vertShader3,
        fragmentShader: fragShader3
    });

    var mapGeometry3 = new THREE.PlaneGeometry(2, 2);
    mapGeometry3.faceVertexUvs[0] = [];
    mapGeometry3.faceVertexUvs[0].push([
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, 1),
        new THREE.Vector2(1, 0)
        ]);
    mapGeometry3.faceVertexUvs[0].push([
        new THREE.Vector2(0, 1),
        new THREE.Vector2(1, 1),
        new THREE.Vector2(1, 0)
      ]);
    var map3 = new THREE.Mesh(mapGeometry3, mapMaterial3);
    scene3.add(map3);

    var render3 = function () {
        requestAnimationFrame(render3);
        uniforms3.time.value += 1.0/30.0;
        renderer3.render(scene3, camera3);
    };

    render3();
</script>
