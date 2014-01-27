---
layout: post
category: 3d
tags: [3d, maps, math]
---

<script src="/assets/js/three.65.js"></script>

The Azimuthal Equidistant Projection shows a map that puts equidistant
points in a circle around the center target of the map.  It is an
interesting and complex projection that can now be done in realtime on
a GPU in your web browser.  Click and drag in the image below to play
with the projection.  See what places on the world are equidistant
from you.

<div id="placeholder"></div>

This works via WebGL in your browser with the three.js library.  The
map is created by drawing a square with texture coordinates that range
across it $[0,1]$.  Each pixel in the square runs a _fragment shader_
that looks up the map color from a world map.

The coordinate transform in the fragment shader is derived from the
following formula via
http://mathworld.wolfram.com/AzimuthalEquidistantProjection.html

<p>
$c = \sqrt{x^2 + y^2};
\phi = asin{ cos{c} sin{phi_1} + \frac{y sin{c} cos{\phi_1}}{c} }
\lambda = \lambda_0 + atan{ \frac{x sin{c}}{ c cos{\phi_1} cos{c} - y sin{\phi_1} sin{c} }}$
<p>

In the fragment shader, we take as input the texture coordinates
(`varying vec2 vUv`) of the current pixel and $phi_1$ (`uniform float
phi1`) and $lambda_1$ (`uniform float lambda1`) input variables that
describe the center of the map.

The `vUv` coordinates are within $[0,1]$, but the projection expects
$x,y$ values from $[-\pi,\pi]$, so we do a simple linear mapping to
accomplish this.  (TAU is, of course 2*$\pi\$)

```c
float x = TAU*(vUv.s - 0.5);
float y = TAU*(vUv.t - 0.5);
```

with x,y in the proper range, we implement the equation from mathworld

```c
float c = sqrt(x*x + y*y);
float phi = asin( cos(c)*sin(phi1) + y*sin(c)*cos(phi1)/c );
float lambda = lambda0 +
    atan( x*sin(c), (c*cos(phi1)*cos(c) - y*sin(phi1)*sin(c)));
```

There is a special case that should be handled when $lambda_0$ is
exactly $\plusminus\frac{pi}{2}$, but those special cases do not seem
to cause artifacts I can see, so I left them out.

After this calculation we need to get the texture lookup coordinates
remapped where $\lambda$ (longitude) maps $[-\pi,\pi]$ to $[0,1]$
while $\phi$ (latitude) is slightly different and maps
$[-fract{/pi}{2},fract{/pi}{2}] to $[0,1]$.

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
cartography effects from a fragment shader.  If you liked this, let me
know on twitter.

<!-- FIXME -- can we load vertex/fragment shader from a file? -->

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
</script>

<script src="/assets/js/azeqproj.js"></script>
