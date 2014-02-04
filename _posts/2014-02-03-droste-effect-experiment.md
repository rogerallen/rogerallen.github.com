---
layout: post
category: webgl
tags: [webgl, opengl, shaders, math]
---

Once again, I've become a bit transfixed by the Droste/Escher Effect
that Hendrik Lenstra and Bart de Smit discuss at their website
[http://escherdroste.math.leidenuniv.nl/](http://escherdroste.math.leidenuniv.nl/).

A few years ago, I found this site that documents the process relatively
clearly
[http://www.josleys.com/article_show.php?id=82](http://www.josleys.com/article_show.php?id=82)
and with some MathMap code from
[http://www.flickr.com/groups/escherdroste/discuss/72157601071820707/](http://www.flickr.com/groups/escherdroste/discuss/72157601071820707/)
I wrote a fragment shader to accomplish the transformation.

Below, I've done a basic translation to Three.js + WebGL fragment
shaders that you can control interactively.  For now, it is just an
experiment to play with.  I'm happy I was able to add simple sliders
to control the parameters.

Perhaps I'll revisit this again someday...

<script src="/assets/js/dragdealer.min.js"></script>
<script src="/assets/js/sprintf.min.js"></script>
<script src="/assets/js/three.min.65.js"></script>

<div id="placeholder"></div>

<div id="slider-r1" class="dragdealer">
  <div id="slider-r1-handle" class="handle bar">r1</div>
</div>
<div id="slider-r2" class="dragdealer">
  <div id="slider-r2-handle" class="handle bar">r2</div>
</div>
<div id="slider-scaleUv" class="dragdealer">
  <div id="slider-scaleUv-handle" class="handle bar">scaleUv</div>
</div>

<script src="/assets/js/droste.js"></script>
