#ifdef GL_ES
precision highp float;
#endif

#define PI  3.1415926535897931
#define TAU 6.2831853071795862

varying vec2      vUv;
uniform sampler2D texture1;
uniform vec2      offset;
uniform float     r1;
uniform float     r2;

// complex math functions
// mul = (x,y)(x',y')=(xx'-yy',xy'+yx')
vec2 cmul(vec2 a, vec2 b) {
  vec2 r;
  r.x = a.x*b.x - a.y*b.y;
  r.y = a.x*b.y + a.y*b.x;
  return r;
}

// r = sqrt(x^2+y^2), theta=atan2(y,x)
vec2 rect2polar(vec2 a) {
  vec2 r;
  r.x = sqrt(a.x*a.x + a.y*a.y);
  r.y = atan(a.y,a.x);
  return r;
}

// log(x + iy) = log(r) + i theta
vec2 clog(vec2 a) {
  vec2 r;
  vec2 p = rect2polar(a);
  r.x = log(p.x);
  r.y = p.y;
  return r;
}

// exp(x + iy) = exp(x)*cos(y) + i exp(x)*sin(y)
vec2 cexp(vec2 a) {
  vec2 r;
  r.x = exp(a.x)*cos(a.y);
  r.y = exp(a.x)*sin(a.y);
  return r;
}

// See:
// http://www.josleys.com/article_show.php?id=82
// http://www.flickr.com/groups/escherdroste/discuss/72157601071820707/
//
// given inner & outer radii: r1, r2
// Alpha = arctan(log(r2/r1)/TAU)
// f = cos(Alpha)
// Beta = f*exp(i*Alpha)
vec2 droste(vec2 z, float r1, float r2) {
    float alpha  = atan(log(r2/r1) / TAU);
    float f      = cos(alpha);
    vec2  beta   = f * cexp(vec2(0, alpha));
    vec2  tmp    = z/r1;
    vec2  zprime = cexp(cmul(beta, clog(tmp)));
    return zprime;
}

void main(void) {
    vec2 zprime = droste(vUv+offset, r1, r2);
    //gl_FragColor = vec4(fract(zprime),0.0,0.0);
    //gl_FragColor = vec4(zprime,0.0,0.0);
    gl_FragColor = texture2D(texture1,zprime);
}
