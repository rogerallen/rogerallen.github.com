varying vec2 vUv;
uniform float scaleUv;
uniform vec2 offsetUv;
void main() {
    vUv = scaleUv * uv + offsetUv;
    gl_Position = projectionMatrix *
        modelViewMatrix *
        vec4(position,1.0);
}
