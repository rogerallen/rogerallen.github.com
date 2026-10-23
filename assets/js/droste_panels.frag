precision highp float;

#define PI    3.14159265358979323846
#define TAU   6.28318530717958647692

// Mode Definitions
#define MODE_INPUT      0  // 1. Input Image: Full texture with interactive UI
#define MODE_SELECTED   1  // 2. Selected Image: The "z-plane" cropped view
#define MODE_LOG_POLAR  2  // 3. Log-polar Map: The "w-plane" unrolled map
#define MODE_TWISTED    3  // 4. Twisted Map: The "w'-plane" twisted map
#define MODE_DROSTE     4  // 5. Final Droste Image: The "z'-plane" spiral result

uniform sampler2D tDiffuse;
uniform int       uMode;
uniform vec2      uResolution; 
uniform vec2      uCenterUV;      // Selection Center
uniform vec2      uFixedPointUV;  // Twist Anchor (z0 in UV space)
uniform float     uSelectionRadius;
uniform float     uZoomFactor;

varying vec2 vUv;

// Complex Math Helpers
vec2 cmul(vec2 a, vec2 b) { return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x); }
vec2 cdiv(vec2 a, vec2 b) { return vec2(dot(a, b), a.y * b.x - a.x * b.y) / dot(b, b); }
vec2 clog(vec2 a) { return vec2(log(length(a)), atan(a.y, a.x)); }
vec2 cexp(vec2 a) { return exp(a.x) * vec2(cos(a.y), sin(a.y)); }

void drawUI(inout vec4 color, vec2 uv, vec2 centerUV, float radius) {
    float res = uResolution.x;
    float dCenter = length(uv - centerUV) * res;
    float outerR  = radius * res;
    float innerR  = (radius / uZoomFactor) * res;
    
    vec4 orange = vec4(1.0, 0.6, 0.0, 1.0);

    color = mix(color, orange, smoothstep(5.0, 4.0, dCenter));
    
    float thickness = 1.5;
    color = mix(color, orange, smoothstep(thickness + 1.0, thickness, abs(length(uv - centerUV)*res - outerR)));
    
    float angle = atan(uv.y - centerUV.y, uv.x - centerUV.x);
    float dots = step(0.5, fract(angle * 30.0 / TAU));
    color = mix(color, orange, smoothstep(thickness + 1.0, thickness, abs(length(uv - centerUV)*res - innerR)) * dots);
}

void drawArrow(inout vec4 color, vec2 uv, vec2 startUV, vec2 endUV, vec4 arrowColor, bool dotted) {
    float res = uResolution.x;
    vec2 p = uv * res;
    vec2 a = startUV * res;
    vec2 b = endUV * res;

    vec2 pa = p - a;
    vec2 ba = b - a;
    float baLenSq = dot(ba, ba);
    if (baLenSq < 1.0) return;
    float baLen = sqrt(baLenSq);

    float h = clamp(dot(pa, ba) / baLenSq, 0.0, 1.0);
    float dShaft = length(pa - ba * h);

    float headLen = 12.0;
    float headWidth = 6.0;
    vec2 dir = ba / baLen;
    vec2 perp = vec2(-dir.y, dir.x);
    vec2 bw1 = -dir * headLen + perp * headWidth;
    vec2 bw2 = -dir * headLen - perp * headWidth;

    vec2 pb = p - b;
    float h1 = clamp(dot(pb, bw1) / dot(bw1, bw1), 0.0, 1.0);
    float dWing1 = length(pb - bw1 * h1);

    float h2 = clamp(dot(pb, bw2) / dot(bw2, bw2), 0.0, 1.0);
    float dWing2 = length(pb - bw2 * h2);

    float thickness = 1.5;
    float shaftMask = smoothstep(thickness + 1.0, thickness, dShaft);
    if (dotted) {
        shaftMask *= step(0.5, fract((h * baLen) / 8.0));
    }
    float headMask = smoothstep(thickness + 1.0, thickness, min(dWing1, dWing2));
    color = mix(color, arrowColor, max(shaftMask, headMask));
}

void drawFixedPoint(inout vec4 color, vec2 uv, vec2 pointUV) {
    float res = uResolution.x;
    float dFixed = length(uv - pointUV) * res;
    vec4 green = vec4(0.0, 0.8, 0.2, 1.0);
    color = mix(color, green, smoothstep(5.0, 4.0, dFixed));
}

void main() {
    float mapScale = 2.1 * PI;
    float L = log(uZoomFactor);
    vec2 z0 = (uFixedPointUV * 2.0 - 1.0) * PI;
    vec2 w0 = clog(z0);
    vec2 w0UV = (w0 / mapScale + 1.0) * 0.5;
    float dirSign = (w0UV.y > 0.5) ? -1.0 : 1.0;
    vec4 orange = vec4(1.0, 0.6, 0.0, 1.0);
    vec4 yellow = vec4(1.0, 0.9, 0.0, 1.0);

    if (uMode == MODE_INPUT) {
        gl_FragColor = texture2D(tDiffuse, vUv);
        drawUI(gl_FragColor, vUv, uCenterUV, uSelectionRadius);
    }
    else if (uMode == MODE_SELECTED) {
        // Screen Pixel to Complex z
        vec2 z = (vUv * 2.0 - 1.0) * PI;

        // Step 5: Map Back to Input Texture (z -> sampleUV)
        vec2 sampleUV = uCenterUV + (z / PI) * uSelectionRadius;
        gl_FragColor = texture2D(tDiffuse, sampleUV);

        drawUI(gl_FragColor, vUv, vec2(0.5, 0.5), 0.5);
        vec2 endUV = vec2(0.5, 0.5) + (uFixedPointUV - vec2(0.5, 0.5)) / uZoomFactor;
        drawArrow(gl_FragColor, vUv, uFixedPointUV, endUV, yellow, true);
        drawFixedPoint(gl_FragColor, vUv, uFixedPointUV);
    }
    else if (uMode == MODE_LOG_POLAR) {
        // Start directly in the untwisted w-plane
        vec2 w = (vUv * 2.0 - 1.0) * mapScale;

        // Step 4: Periodic Tiling (mod into the Fundamental Annulus)
        w.x = mod(w.x - log(PI), L) + log(PI) - L;
        w.y = mod(w.y + PI, TAU) - PI;

        // Step 5: Map Back to Input Texture (w -> z -> sampleUV)
        vec2 z = cexp(w);
        vec2 sampleUV = uCenterUV + (z / PI) * uSelectionRadius;
        gl_FragColor = texture2D(tDiffuse, sampleUV);

        vec2 endUV = w0UV + dirSign * vec2(L, TAU) / (2.0 * mapScale);
        drawArrow(gl_FragColor, vUv, w0UV, endUV, orange, false);
        drawFixedPoint(gl_FragColor, vUv, w0UV);
    }
    else if (uMode == MODE_TWISTED) {
        // Start directly in the twisted w'-plane
        vec2 wPrime = (vUv * 2.0 - 1.0) * mapScale;

        // Step 3: Inverse Twist (w' -> w)
        vec2 c = cdiv(vec2(0.0, TAU), vec2(L, TAU));
        vec2 w = cdiv(wPrime - w0, c) + w0;

        // Step 4: Periodic Tiling (mod into the Fundamental Annulus)
        w.x = mod(w.x - log(PI), L) + log(PI) - L;
        w.y = mod(w.y + PI, TAU) - PI;

        // Step 5: Map Back to Input Texture (w -> z -> sampleUV)
        vec2 z = cexp(w);
        vec2 sampleUV = uCenterUV + (z / PI) * uSelectionRadius;
        gl_FragColor = texture2D(tDiffuse, sampleUV);

        vec2 endUV = w0UV + dirSign * vec2(0.0, TAU) / (2.0 * mapScale);
        drawArrow(gl_FragColor, vUv, w0UV, endUV, orange, false);
        drawFixedPoint(gl_FragColor, vUv, w0UV);
    }
    else if (uMode == MODE_DROSTE) {
        // Step 1: Screen Pixel to Complex z'
        vec2 zPrime = (vUv * 2.0 - 1.0) * PI;

        // Step 2: Unroll to Twisted Plane (z' -> w')
        vec2 wPrime = clog(zPrime);

        // Step 3: Inverse Twist (w' -> w)
        vec2 c = cdiv(vec2(0.0, TAU), vec2(L, TAU));
        vec2 w = cdiv(wPrime - w0, c) + w0;

        // Step 4: Periodic Tiling (mod into the Fundamental Annulus)
        w.x = mod(w.x - log(PI), L) + log(PI) - L;
        w.y = mod(w.y + PI, TAU) - PI;

        // Step 5: Map Back to Input Texture (w -> z -> sampleUV)
        vec2 z = cexp(w);
        vec2 sampleUV = uCenterUV + (z / PI) * uSelectionRadius;
        gl_FragColor = texture2D(tDiffuse, sampleUV);
    }
}