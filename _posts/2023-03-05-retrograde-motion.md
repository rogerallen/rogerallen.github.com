---
layout: post
category: astronomy
tags: [astronomy, threejs]
---

This blog entry is visualizing "apparent retrograde motion" of the Earth-Mars system.  Retrograde motion is the apparent motion of an outer planet like Mars moving "backwards" then "forwards" in the night sky.  UPDATE: After a request from Austin Heller on Mastodon, I've added the ability  to optionally show the inner planet Venus, too.  Inner planets have a similar, but different type of retrograde.

Note the yellow and red lines in the diagram below.  The yellow line is a line from the Sun through the Earth.  It can represent what "midnight" points to in the night sky.  Over a year it sweeps clockwise across the whole sky.  The rotating light-shaded half of the view shows which part of the sky is daylight (facing the Sun from the Earth). 

The red line is from the Earth to Mars.  It shows where Mars is located in our night sky.  It typically moves clockwise across the night sky much like the yellow line, but just a little slower.  However, when the Earth approaches Mars, the red line slows down and reverses direction to move counter-clockwise in our night sky.  Only after the Earth passes will it then start moving clockwise again.  This happens each time the Mars and Earth are in conjunction (closest to each other) about once every two years.

<style>
  canvas { width: inherit; position: relative; top: 0;}
</style>
<div id='canvas-holder' style="position: relative; width: inherit;">
  <div id="dat-gui-holder" style="position: absolute; top: 0em; left: 0em; z-index: 1;"></div>
</div>

You can learn more about apparent retrograde motion on [Wikipedia](https://en.wikipedia.org/wiki/Apparent_retrograde_motion).  If you want a way to view where the planets are in our solar system right now, check out [solarsystem.nasa.gov](https://solarsystem.nasa.gov/).

Note that you can also adjust all the values in the controls.  Zoom in & out.  Make things go faster, slower or in reverse.  Zooming all the way out makes it clear how the apparent motion of the planet changes over time, but zooming in helps you understand the mechanism.

The orbit sizes and relative times are to scale.  Mars is 1.5 times as far as the earth is from the Sun and Mars' orbit takes 687 days or 1.8 times our 365 days.  The sizes and spin of the planets is not to scale.  

*I believe I will continue to update this over time.  Send feedback if you have ideas.*

<script type="module" src="/assets/js/solar-system.js"></script>
