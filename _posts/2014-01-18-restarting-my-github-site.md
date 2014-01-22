---
layout: post
category : blog
tags : [blog, jekyll]
---
{% include JB/setup %}

This is what I did to restart my site as a Jekyll site.  I combined
[https://github.com/plusjade/jekyll-bootstrap](https://github.com/plusjade/jekyll-bootstrap)
and
[https://github.com/kevinxueliang/jb-svbtle](https://github.com/kevinxueliang/jb-svbtle)
along with some tweaks of my own.

### Why?

I wanted a better theme and it seemed easier to switch to Jekyll to
find themes to steal from.  I am not a web designer.

I want to be able to discuss with well-formatted code.  Clojure code...

```clojure
 (defsynth saw-synth-1
    "a basic saw synth"
    [pitch-midi {:default 60  :min 40   :max 70  :step 1}
     gate       {:default 1.0 :min 0.0  :max 1.0 :step 1}
     position   {:default 0.0 :min -1.0 :max 1.0 :step 0.1}
     out-bus    {:default 0   :min 0    :max 128 :step 1}]
    (let [pitch-freq (midicps pitch-midi)
          saw-out (saw pitch-freq)]
      (out out-bus (pan2 (* gate saw-out) position))))
```

and even GLSL code...

```glsl
vec2 getScreenUV(vec2 fc) {
    vec2 uv = fc/iResolution.xy;  // uv = [0,1)
    uv = 2.0*uv-1.0;              // uv = [-1,1)
    float aspect_ratio = iResolution.x / iResolution.y;
    if(aspect_ratio < 1.0) {
        uv.x /= aspect_ratio;     // u  = [-ar,ar), v = [-1,1)
    } else {
        uv.y /= aspect_ratio;     // u  = [-1,1),  v = [-ar,ar)
    }
    return(uv);
}
```

I want to be able to demonstrate audio...

<audio controls="controls" height="40" width="100">
  <source src="/assets/audio/guitar-e-chord.mp3" type="audio/mp3">
  <source src="/assets/audio/guitar-e-chord.ogg" type="audio/ogg">
  <embed height="35" width="160" src="/assets/audio/guitar-e-chord.mp3">
</audio>

I want to enclose images...

<img src="/assets/image/guitar-e-chord-wav.png" width="645" height="141" />

And sometimes, I want to discuss math with the clarity of a real equation via
[MathJax](http://www.mathjax.org/)

<p style="font-size: 150%;" >
$\frac{\partial y}{\partial t} = v_0 + \left( \frac{ v_1 - v_0 }{ y_1 - y_0 } \right) ( y - y_0 )$
</p>

And after a bit of editing the files
`assets/themes/jb-svbtle/css/fixes.css` and
`_includes/themes/jb-svbtle/default.html`, along with some help from
@holman--hey, it works!
