---
layout: post
title: "The Droste Effect Explained"
description: "A 4-panel interactive dive into the log-polar math of the Droste effect."
category: webgl
tags: [webgl, threejs, math, droste]
---

The Droste effect, also known as mise en abyme, is a specific kind of recursive picture where a smaller version of the image appears within itself. While it looks like a simple zoom, the most fascinating versions involve a "twist" or spiral.

As explained in the excellent [3Blue1Brown video](https://www.youtube.com/watch?v=ldxFjLJ3rVY), we can understand this effect through a series of mathematical transformations in the complex plane.

### The 4-Panel Visualization

Below are four panels showing the transformation process:
1.  **The Log-polar Map**: We apply $w = \ln(z)$, which maps circles to vertical lines and rays from the origin to horizontal lines.
2.  **The Original Image**: Our starting point in the complex $z$-plane.
3.  **The Transformed Map**: This is where the "twist" happens. We can rotate and scale the image in this log-plane. **Try dragging your mouse/finger on this panel!**
4.  **The Final Droste**: We apply the inverse transform $z = e^{w'}$, mapping the transformed grid back to a spiral.

<div id="texture-selector" style="margin-bottom: 15px; text-align: left; display: flex; align-items: center; gap: 20px;">
  <div>
    <label for="texture-select"><strong>Select Texture:</strong></label>
    <select id="texture-select" style="padding: 5px; border-radius: 4px; border: 1px solid #ccc;">
      <option value="/assets/image/archery_target.png">Archery Target</option>
      <option value="/assets/image/grid.png">Grid</option>
      <option value="/assets/image/uhrenmacher.jpg">Uhrenmacher</option>
    </select>
  </div>
  <div>
    <label for="texture-upload"><strong>Or Upload Image:</strong></label>
    <input type="file" id="texture-upload" accept="image/*" style="padding: 5px;">
  </div>
</div>

First we select an image to start with.  Place the center and select an appropriate radius.

<div id="raw-image-container" style="width: 100%; max-width: 800px; margin: 0 0 20px 0; text-align: left; display: flex; align-items: flex-start; gap: 20px;">
  <div class="panel-box" style="flex: 0 0 50%;">
    <div id="panel-0" class="droste-panel" style="width: 100%; margin: 0;"></div>
    <div class="panel-label">Raw Texture Image</div>
  </div>
  <div style="padding-top: 25px;">
    <label for="zoom-select"><strong>Droste Zoom:</strong></label><br>
    <select id="zoom-select" style="padding: 5px; border-radius: 4px; border: 1px solid #ccc; margin-top: 5px;">
      <option value="2">2x</option>
      <option value="4" selected>4x</option>
      <option value="8">8x</option>
      <option value="16">16x</option>
      <option value="32">32x</option>
    </select>
    <p style="font-size: 0.85em; color: #666; margin-top: 10px; max-width: 200px;">
      The ratio between the outer and inner circles of the transformation.
    </p>
  </div>
</div>

<div id="droste-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; max-width: 800px; margin: 20px 0;">
  <div class="panel-box">
    <div id="panel-2" class="droste-panel"></div>
    <div class="panel-label">2. Log-polar ($\ln(z)$)</div>
  </div>
  <div class="panel-box">
    <div id="panel-1" class="droste-panel"></div>
    <div class="panel-label">1. Original Image ($z$)</div>
  </div>
  <div class="panel-box">
    <div id="panel-3" class="droste-panel" style="cursor: move; border: 2px solid #007bff;"></div>
    <div class="panel-label">3. Interactive Transform ($w' = A \cdot w$)</div>
  </div>
  <div class="panel-box">
    <div id="panel-4" class="droste-panel"></div>
    <div class="panel-label">4. Final Droste ($e^{w'}$)</div>
  </div>
</div>

<style>
  .droste-panel {
    width: 100%;
    aspect-ratio: 1 / 1;
    background: #f0f0f0;
    border: 1px solid #ccc;
  }
  .panel-box {
    text-align: left;
  }
  .panel-label {
    margin-top: 5px;
    font-weight: bold;
    font-size: 0.9em;
  }
</style>

<!-- Load the custom Three.js script as a module -->
<script type="module" src="{{ '/assets/js/droste_panels.js' | relative_url }}"></script>
