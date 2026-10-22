---
layout: post
title: "The Droste Effect Explained"
description: "A mathematical journey into the log-polar math of the Droste effect."
category: webgl
tags: [webgl, threejs, math, droste]
---

The Droste effect, also known as *mise en abyme*, is a recursive image where a smaller version of the image appears within itself. While it often looks like a simple zoom, the most fascinating versions involve a "twist" or spiral.

As explained in the excellent [3Blue1Brown video](https://www.youtube.com/watch?v=ldxFjLJ3rVY), we can understand this effect through a series of mathematical transformations in the complex plane.

### The Mathematical Pipeline

Below are five panels showing the transformation process:
0.  **Raw Texture**: Select your image and define the circular region. The orange point is the center, the blue point is the "fixed point" of the twist, and the dotted orange circle defines the zoom factor.
1.  **Original Selection**: This is our starting point in the complex $z$-plane, cropped from the texture.
2.  **Log-polar Map**: We apply $w = \ln(z)$, unrolling the circular selection into a rectangular map.
3.  **Twisted Map**: We apply the "perfect" twist $w' = c \cdot (w - w_0) + w_0$, which aligns the image for a seamless spiral.
4.  **Final Droste**: We apply the inverse transform $z = e^{w'}$, mapping the twisted grid back to a spiral.

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

<div id="raw-image-container" style="width: 100%; max-width: 800px; margin: 0 0 20px 0; text-align: left; display: flex; align-items: flex-start; gap: 20px;">
  <div class="panel-box" style="flex: 0 0 50%;">
    <div id="panel-0" class="droste-panel" style="width: 100%; margin: 0;"></div>
    <div class="panel-label">0. Raw Texture Image</div>
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
    <div class="panel-label">2. Log-polar Map ($\ln(z)$)</div>
  </div>
  <div class="panel-box">
    <div id="panel-1" class="droste-panel"></div>
    <div class="panel-label">1. Original Image ($z$)</div>
  </div>
  <div class="panel-box">
    <div id="panel-3" class="droste-panel"></div>
    <div class="panel-label">3. Twisted Map ($w' = c \cdot w$)</div>
  </div>
  <div class="panel-box">
    <div id="panel-4" class="droste-panel"></div>
    <div class="panel-label">4. Final Droste ($e^{w'}$)</div>
  </div>
</div>

<div id="tweak-container" style="width: 100%; max-width: 800px; margin: 20px 0; text-align: left; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
  <div>
    <label for="tweak-real-slider"><strong>Tweak Twist (Real):</strong> <span id="tweak-real-value">0.000</span></label><br>
    <input type="range" id="tweak-real-slider" min="-0.1" max="0.1" step="0.001" value="0.0" style="width: 100%; margin-top: 10px;">
  </div>
  <div>
    <label for="tweak-imag-slider"><strong>Tweak Twist (Imaginary):</strong> <span id="tweak-imag-value">0.000</span></label><br>
    <input type="range" id="tweak-imag-slider" min="-0.1" max="0.1" step="0.001" value="0.0" style="width: 100%; margin-top: 10px;">
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
