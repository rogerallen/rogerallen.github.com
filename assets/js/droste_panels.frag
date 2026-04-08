precision highp float;

#define PI  3.1415926535897932384626433832795
#define INVPI 0.3183098861837907
#define TAU 6.2831853071795864769252867665590

uniform sampler2D tDiffuse;
uniform int       uMode;     // 1=Original, 2=Log-polar, 3=Transform, 4=Final
uniform float     uRotation;
uniform float     uScale;
uniform float     uTime;
uniform vec2      uResolution;
uniform vec2      uPoint;
uniform vec2      uPoint0;
uniform float     uRadius;
uniform float     uZoom;

varying vec2 vUv;

void drawControls(inout vec4 color, vec2 uv, vec2 point, vec2 point0, float radius, float zoom) {
    float res = uResolution.x;
    vec2 diff = uv - point;
    float d = length(diff) * res;
    float r = radius * res;
    float innerR = (radius / zoom) * res;
    
    // Orange Point (sizes in pixels)
    float pointSize = 4.0;
    float pointEdge = 1.0;
    float pointAlpha = smoothstep(pointSize + pointEdge, pointSize, d);
    color = mix(color, vec4(1.0, 0.6, 0.0, 1.0), pointAlpha);

    // Blue Point (z0)
    float d0 = length(uv - point0) * res;
    float pointAlpha0 = smoothstep(pointSize + pointEdge, pointSize, d0);
    color = mix(color, vec4(0.0, 0.4, 1.0, 1.0), pointAlpha0);
    
    // Outer Circle (solid orange)
    float thickness = 1.5;
    float circleEdge = 1.0;
    float circleAlpha = smoothstep(thickness + circleEdge, thickness, abs(d - r));
    color = mix(color, vec4(1.0, 0.6, 0.0, 1.0), circleAlpha);

    // Inner Circle (dotted orange)
    float angle = atan(diff.y, diff.x);
    float dots = 30.0;
    float dotPattern = step(0.5, fract(angle * dots / TAU));
    float innerCircleAlpha = smoothstep(thickness + circleEdge, thickness, abs(d - innerR)) * dotPattern;
    color = mix(color, vec4(1.0, 0.6, 0.0, 1.0), innerCircleAlpha);
}

// Complex Multiplication: (x,y)(x',y') = (xx'-yy', xy'+yx')
vec2 cmul(vec2 a, vec2 b) {
  return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}

// Complex Division: (a + bi) / (c + di)
vec2 cdiv(vec2 a, vec2 b) {
    float d = dot(b, b); // Denominator: c^2 + d^2
    return vec2(dot(a, b), a.y * b.x - a.x * b.y) / d;
}

// Log(x + iy) = log|z| + i*arg(z)
vec2 clog(vec2 a) {
  float r = length(a);
  float theta = atan(a.y, a.x); // -PI to PI output
  //theta += PI; // 0 to 2PI output
  return vec2(log(r), theta);
}

// Exp(x + iy) = exp(x)*cos(y) + i*exp(x)*sin(y)
vec2 cexp(vec2 a) {
  return exp(a.x) * vec2(cos(a.y), sin(a.y));
}

// Input: x = radius, y = angle (theta)
// Output: x = horizontal, y = vertical
vec2 polar2cartesian(vec2 polar) {
    float r = polar.x;
    float theta = polar.y;
    return vec2(r * cos(theta), r * sin(theta));
}

void main() {
    // Standardize UV from [0,1] to [-1,1] for complex plane math
    vec2 z = (vUv * 2.0 - 1.0);
    vec2 zprime;
    
    if (uMode == 0) {
        // Mode 0: Raw Texture with Controls
        gl_FragColor = texture2D(tDiffuse, vUv);
        drawControls(gl_FragColor, vUv, uPoint, uPoint0, uRadius, uZoom);
    } else if (uMode == 1) {
        // Mode 1: Cropped Original Image (z)
        // Map vUv (0..1) to [uPoint - uRadius, uPoint + uRadius]
        zprime = uPoint + z * uRadius;
        gl_FragColor = texture2D(tDiffuse, zprime);
    } else if (uMode == 2) {
        // Mode 2: Log-polar (ln(z))
        // go from -PI to PI and exp into Original
        z = z*PI;
        // make it periodic
        float L = log(uZoom);
        z.x = mod(z.x - log(PI), L) + log(PI) - L;
        z.y = mod(z.y + PI, 2.0*PI) - PI;
        vec2 w = cexp(z);
        // Map [-PI, PI] range of w to the crop in tDiffuse
        zprime = uPoint + (w * INVPI) * uRadius;
        gl_FragColor = texture2D(tDiffuse, zprime);
    } 
    else if (uMode == 3) {
        // Mode 3: Log-polar with interactive transform (w' = A * w)
        z = z*PI;
        
        // apply scale & rotation to z
        vec2 z0 = clog((uPoint0 - uPoint) * PI / uRadius);

        // 1. Define 'c' constant: 2*PI*i / (ln(uZoom) + 2*PI*i)
        vec2 num = vec2(0.0, 2.0 * PI);
        vec2 den = vec2(log(uZoom), 2.0 * PI);
        vec2 c = cdiv(num, den);

        // 2. Apply the formula: z = c * (z - z0) + z0
        z = cmul(c, z - z0) + z0;
        // make it periodic
        float L = log(uZoom);
        z.x = mod(z.x - log(PI), L) + log(PI) - L;
        z.y = mod(z.y + PI, 2.0*PI) - PI;
        vec2 w = cexp(z);

        // Map [-PI, PI] range of w to the crop in tDiffuse
        zprime = uPoint + (w * INVPI) * uRadius;
        gl_FragColor = texture2D(tDiffuse, zprime);
    } 
    else if (uMode == 4) {
        // Mode 4: Final Droste (Inverse transform z = e^w')
        z = z*PI;
        z = clog(z);
        
        // apply scale & rotation to z
        vec2 z0 = clog((uPoint0 - uPoint) * PI / uRadius);

        // 1. Define 'c' constant: 2*PI*i / (ln(uZoom) + 2*PI*i)
        vec2 num = vec2(0.0, 2.0 * PI);
        vec2 den = vec2(log(uZoom), 2.0 * PI);
        vec2 c = cdiv(num, den);

        // 2. Apply the formula: z = c * (z - z0) + z0
        z = cmul(c, z - z0) + z0;
        // make it periodic
        float L = log(uZoom);
        z.x = mod(z.x - log(PI), L) + log(PI) - L;
        z.y = mod(z.y + PI, 2.0*PI) - PI;
        vec2 w = cexp(z);
        
        // Map [-PI, PI] range of w to the crop in tDiffuse
        zprime = uPoint + (w * INVPI) * uRadius;
        gl_FragColor = texture2D(tDiffuse, zprime);
    }
}