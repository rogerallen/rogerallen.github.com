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
uniform float     uInteractiveRotation;
uniform float     uInteractiveScale;
uniform vec2      uResolution;
uniform vec2      uCenterUV;      // Selection Center
uniform vec2      uFixedPointUV;  // Twist Anchor (z0)
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
    float dFixed  = length(uv - uFixedPointUV) * res;
    float outerR  = uSelectionRadius * res;
    float innerR  = (uSelectionRadius / uZoomFactor) * res;
    
    vec4 orange = vec4(1.0, 0.6, 0.0, 1.0);
    vec4 blue   = vec4(0.0, 0.5, 1.0, 1.0);

    color = mix(color, orange, smoothstep(5.0, 4.0, dCenter));
    color = mix(color, blue,   smoothstep(5.0, 4.0, dFixed));
    
    float thickness = 1.5;
    color = mix(color, orange, smoothstep(thickness + 1.0, thickness, abs(length(uv - uCenterUV)*res - outerR)));
    
    float angle = atan(uv.y - uCenterUV.y, uv.x - uCenterUV.x);
    float dots = step(0.5, fract(angle * 30.0 / TAU));
    color = mix(color, orange, smoothstep(thickness + 1.0, thickness, abs(length(uv - uCenterUV)*res - innerR)) * dots);
}

void main() {
    // Standardize coordinates to [-PI, PI]
    vec2 z = (vUv * 2.0 - 1.0) * PI; 
    vec2 sampleUV;
    
    if (uMode == MODE_RAW) {
        gl_FragColor = texture2D(tDiffuse, vUv);
        drawUI(gl_FragColor, vUv);
        return;
    } 
    
    if (uMode == MODE_ORIGINAL) {
        sampleUV = uCenterUV + (z / PI) * uSelectionRadius;
        gl_FragColor = texture2D(tDiffuse, sampleUV);
    } 
    else {
        float L = log(uZoomFactor);
        
        // Step 1: Initialize Log-Polar coordinate (w)
        // Mode 2 & 3 are viewed in the map plane (w), Mode 4 in the z-plane.
        vec2 w = (uMode == MODE_LOG_POLAR || uMode == MODE_TRANSFORM) ? z : clog(z);

        // Step 2: Apply Twist
        if (uMode == MODE_TRANSFORM || uMode == MODE_DROSTE) {
            vec2 w0 = clog((uFixedPointUV - uCenterUV) * PI / uSelectionRadius);
            vec2 c = cdiv(vec2(0.0, TAU), vec2(L, TAU));
            w = cmul(c, w - w0) + w0;

            // Apply interactive offsets
            float angle = uInteractiveRotation;
            float scale = exp(-uInteractiveScale);
            mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
            w = rot * (w * scale);
        }

        // Step 3: Periodic Tiling
        w.x = mod(w.x - log(PI), L) + log(PI) - L;
        w.y = mod(w.y + PI, TAU) - PI;

        // Step 4: Map back to Texture
        vec2 finalZ = cexp(w);
        sampleUV = uCenterUV + (finalZ / PI) * uSelectionRadius;
        gl_FragColor = texture2D(tDiffuse, sampleUV);
    }
}