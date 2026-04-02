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

varying vec2 vUv;

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
    
    if (uMode == 1) {
        // Mode 1: Original Image
        zprime = vUv;  // 0 to 1
        gl_FragColor = texture2D(tDiffuse, zprime);
    } else if (uMode == 2) {
        // go from -PI to PI and exp into Original
        z = z*PI;  // z = -pi to pi just like video at 23:35
        // make it periodic -1,1 and -pi,pi
        z.x = mod(z.x + 1.0, 2.0) - 1.0;
        z.y = mod(z.y + PI, 2.0*PI) - PI;
        zprime = cexp(z);
        zprime = (zprime + PI)*0.5*INVPI;
        gl_FragColor = texture2D(tDiffuse, zprime);
    }
    //else if (uMode == 3) {
    //    float c = cos(uRotation);
    //    float s = sin(uRotation);
    //    mat2 rot = mat2(c, -s, s, c);
    //
    //    // Mode 3: Log-polar with interactive transform (w' = A * w)
    //    z = z*PI;
    //    // make it periodic -1,1 and -pi,pi
    //    z.x = mod(z.x + 1.0, 2.0) - 1.0;
    //    z.y = mod(z.y + PI, 2.0*PI) - PI;
    //    // apply scale & rotation to z
    //    z = z * uScale;
    //    z = rot * z;
    //    vec2 w = cexp(z);
    //
    //    zprime = (w + PI)*0.5*INVPI;
    //    gl_FragColor = texture2D(tDiffuse, zprime);
    //} 
    else if (uMode == 3) {
        // Mode 3: Log-polar with interactive transform (w' = A * w)
        z = z*PI;
        
        // apply scale & rotation to z
        vec2 z0 = vec2(0.0, 0.5);  // fix to get this from interactive input

        // 1. Define 'c' constant: 2*PI*i / (ln(16) + 2*PI*i)
        float scale = 9.5; // 16 in the formula above
        vec2 num = vec2(0.0, 2.0 * PI);
        vec2 den = vec2(log(scale), 2.0 * PI);
        vec2 c = cdiv(num, den);

        // 2. Apply the formula: z = c * (z - z0) + z0
        z = cmul(c, z - z0) + z0;
        // make it periodic -1,1 and -pi,pi (had to move this!)
        z.x = mod(z.x + 1.0, 2.0) - 1.0;
        z.y = mod(z.y + PI, 2.0*PI) - PI;
        vec2 w = cexp(z);

        zprime = (w + PI)*0.5*INVPI;
        gl_FragColor = texture2D(tDiffuse, zprime);
    } 
    //else if (uMode == 4) {
    //    // Mode 4: Final Droste (Inverse transform z = e^w')
    //    vec2 w = clog(z);
    //    
    //    // Transform the log coordinate
    //    vec2 wprime = w * uScale;
    //    float c = cos(uRotation);
    //    float s = sin(uRotation);
    //    mat2 rot = mat2(c, -s, s, c);
    //    wprime = rot * wprime;
    //
    //    // Map back to complex plane using exp()
    //    vec2 finalZ = cexp(wprime);
    //     
    //    // Wrap for repetition (the "Droste" infinity)
    //    zprime = fract(finalZ * 0.5 + 0.5);
    //    gl_FragColor = texture2D(tDiffuse, zprime);
    //}
    else if (uMode == 4) {
        // Mode 4: Final Droste (Inverse transform z = e^w')
        z = z*PI;
        z = clog(z);  // ??? I think ???
        
        // apply scale & rotation to z
        vec2 z0 = vec2(0.0, 0.5);  // fix to get this from interactive input

        // 1. Define 'c' constant: 2*PI*i / (ln(16) + 2*PI*i)
        float scale = 9.5; // 16 in the formula above
        vec2 num = vec2(0.0, 2.0 * PI);
        vec2 den = vec2(log(scale), 2.0 * PI);
        vec2 c = cdiv(num, den);

        // 2. Apply the formula: z = c * (z - z0) + z0
        z = cmul(c, z - z0) + z0;
        // make it periodic -1,1 and -pi,pi (had to move this!)
        z.x = mod(z.x + 1.0, 2.0) - 1.0;
        z.y = mod(z.y + PI, 2.0*PI) - PI;
        vec2 w = cexp(z);
        
        zprime = (w + PI)*0.5*INVPI;
        gl_FragColor = texture2D(tDiffuse, zprime);
    }
}
