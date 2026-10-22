precision highp float;

#define PI    3.14159265358979323846
#define TAU   6.28318530717958647692
#define INVPI 0.3183098861837907

// Mode Definitions
#define MODE_RAW        0  // Full texture with interactive UI
#define MODE_ORIGINAL   1  // The "z-plane": a cropped circular view
#define MODE_LOG_POLAR  2  // The "w-plane": unrolling the circle into a map
#define MODE_TRANSFORM  3  // The "w'-plane": twisting the map
#define MODE_DROSTE     4  // The "Final Result": mapping w' back to the z-plane

uniform sampler2D tDiffuse;
uniform int       uMode;
uniform vec2      uResolution; 
uniform vec2      uCenterUV;      // Selection Center
uniform vec2      uFixedPointUV;  // Twist Anchor (w0)
uniform float     uSelectionRadius;
uniform float     uZoomFactor;

varying vec2 vUv;

// Complex Math Helpers
vec2 cmul(vec2 a, vec2 b) { return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x); }
vec2 cdiv(vec2 a, vec2 b) { return vec2(dot(a, b), a.y * b.x - a.x * b.y) / dot(b, b); }
vec2 clog(vec2 a) { return vec2(log(length(a)), atan(a.y, a.x)); }
vec2 cexp(vec2 a) { return exp(a.x) * vec2(cos(a.y), sin(a.y)); }

void drawUI(inout vec4 color, vec2 uv) {
    float res = uResolution.x;
    float dCenter = length(uv - uCenterUV) * res;
    float outerR  = uSelectionRadius * res;
    float innerR  = (uSelectionRadius / uZoomFactor) * res;
    
    vec4 orange = vec4(1.0, 0.6, 0.0, 1.0);

    color = mix(color, orange, smoothstep(5.0, 4.0, dCenter));
    
    float thickness = 1.5;
    color = mix(color, orange, smoothstep(thickness + 1.0, thickness, abs(length(uv - uCenterUV)*res - outerR)));
    
    float angle = atan(uv.y - uCenterUV.y, uv.x - uCenterUV.x);
    float dots = step(0.5, fract(angle * 30.0 / TAU));
    color = mix(color, orange, smoothstep(thickness + 1.0, thickness, abs(length(uv - uCenterUV)*res - innerR)) * dots);
}

void drawArrow(inout vec4 color, vec2 uv, vec2 startUV, vec2 endUV, vec4 arrowColor) {
    float res = uResolution.x;
    vec2 p = uv * res;
    vec2 a = startUV * res;
    vec2 b = endUV * res;

    vec2 pa = p - a;
    vec2 ba = b - a;
    float baLenSq = dot(ba, ba);
    if (baLenSq < 1.0) return;

    float h = clamp(dot(pa, ba) / baLenSq, 0.0, 1.0);
    float dShaft = length(pa - ba * h);

    float headLen = 12.0;
    float headWidth = 6.0;
    vec2 dir = normalize(ba);
    vec2 perp = vec2(-dir.y, dir.x);
    vec2 bw1 = -dir * headLen + perp * headWidth;
    vec2 bw2 = -dir * headLen - perp * headWidth;

    vec2 pb = p - b;
    float h1 = clamp(dot(pb, bw1) / dot(bw1, bw1), 0.0, 1.0);
    float dWing1 = length(pb - bw1 * h1);

    float h2 = clamp(dot(pb, bw2) / dot(bw2, bw2), 0.0, 1.0);
    float dWing2 = length(pb - bw2 * h2);

    float d = min(dShaft, min(dWing1, dWing2));
    float thickness = 1.5;
    color = mix(color, arrowColor, smoothstep(thickness + 1.0, thickness, d));
}

void drawFixedPoint(inout vec4 color, vec2 uv, vec2 pointUV) {
    float res = uResolution.x;
    float dFixed = length(uv - pointUV) * res;
    vec4 green = vec4(0.0, 0.8, 0.2, 1.0);
    color = mix(color, green, smoothstep(5.0, 4.0, dFixed));
}

void main() {
    float mapScale = 2.1 * PI;
    vec2 sampleUV;
    
    if (uMode == MODE_RAW) {
        gl_FragColor = texture2D(tDiffuse, vUv);
        drawUI(gl_FragColor, vUv);
        return;
    } 
    
    if (uMode == MODE_ORIGINAL) {
        vec2 z = (vUv * 2.0 - 1.0) * PI;
        sampleUV = uCenterUV + (z / PI) * uSelectionRadius;
        gl_FragColor = texture2D(tDiffuse, sampleUV);
        drawFixedPoint(gl_FragColor, vUv, uFixedPointUV);
        return;
    } 

    float L = log(uZoomFactor);
    vec2 z0 = (uFixedPointUV * 2.0 - 1.0) * PI;
    vec2 w0 = clog(z0);
    vec2 w0UV = (w0 / mapScale + 1.0) * 0.5;

    // Step 1: Screen Pixel to Complex z' (used by MODE_DROSTE)
    vec2 zPrime = (vUv * 2.0 - 1.0) * PI;

    // Step 2: Unroll to Twisted Plane (z' -> w')
    // Mode 3 (MODE_TRANSFORM) starts directly in the w'-plane
    vec2 wPrime = (uMode == MODE_TRANSFORM)
        ? (vUv * 2.0 - 1.0) * mapScale
        : clog(zPrime);

    // Step 3: Inverse Twist (w' -> w)
    // Mode 2 (MODE_LOG_POLAR) starts directly in the untwisted w-plane
    vec2 w;
    if (uMode == MODE_LOG_POLAR) {
        w = (vUv * 2.0 - 1.0) * mapScale;
    } else {
        vec2 num = vec2(0.0, TAU);
        vec2 den = vec2(L, TAU);
        vec2 c = cdiv(num, den);
        w = cdiv(wPrime - w0, c) + w0;
    }

    // Step 4: Periodic Tiling (mod into the Fundamental Annulus)
    w.x = mod(w.x - log(PI), L) + log(PI) - L;
    w.y = mod(w.y + PI, TAU) - PI;

    // Step 5: Map Back to Input Texture (w -> z -> sampleUV)
    vec2 z = cexp(w);
    sampleUV = uCenterUV + (z / PI) * uSelectionRadius;
    gl_FragColor = texture2D(tDiffuse, sampleUV);

    float dirSign = (w0UV.y > 0.5) ? -1.0 : 1.0;

    if (uMode == MODE_LOG_POLAR) {
        vec4 orange = vec4(1.0, 0.6, 0.0, 1.0);
        vec2 endUV = w0UV + dirSign * vec2(L, TAU) / (2.0 * mapScale);
        drawArrow(gl_FragColor, vUv, w0UV, endUV, orange);
        drawFixedPoint(gl_FragColor, vUv, w0UV);
    }
    else if (uMode == MODE_TRANSFORM) {
        vec4 orange = vec4(1.0, 0.6, 0.0, 1.0);
        vec2 endUV = w0UV + dirSign * vec2(0.0, TAU) / (2.0 * mapScale);
        drawArrow(gl_FragColor, vUv, w0UV, endUV, orange);
        drawFixedPoint(gl_FragColor, vUv, w0UV);
    }
}