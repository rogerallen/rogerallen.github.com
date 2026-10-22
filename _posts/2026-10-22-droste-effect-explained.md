---
layout: post
title: "The Droste Effect Explained"
description: "A mathematical journey into the log-polar math of the Droste effect."
category: webgl
tags: [webgl, threejs, math, droste]
---

The Droste effect, also known as _mise en abyme_, is a recursive image where a smaller version of the image appears within itself. While it often looks like a simple zoom, the most fascinating versions involve a "twist" or spiral.

As explained in the excellent [3Blue1Brown video](https://www.youtube.com/watch?v=ldxFjLJ3rVY), we can understand this effect through a series of mathematical transformations in the complex plane.

### The Mathematical Pipeline

Below are five panels showing the transformation process. 2-5 are in the order specified in the youtube video:

1.  **Input Image**: From the dropdown, select your input image and then use the following controls to define how this image is used.
    1. adjust the <span style="color: orange;">orange circular region</span> that we can read,
    1. the <span style="color: orange;">orange point</span> is the center, which you can move around, and
    1. the <span style="color: orange;">dotted orange circle</span> shows the selected zoom factor.

1.  **Original Selection**: This is our starting point in the complex $z$-plane, cropped from the input image via the <span style="color: orange;">orange circular region</span>. You can click and drag the interactive <span style="color: green;">green point</span> ($z_0$) here to choose the fixed point for the twist.
1.  **Log-polar Map**: We apply $w = \ln(z)$, unrolling the circular selection into a rectangular map. This unrolls the annulus between the <span style="color: orange;">inner dotted orange circle</span> and the <span style="color: orange;">outer solid orange circle</span>. The <span style="color: green;">green point</span> ($w_0 = \ln(z_0)$) is the mapped fixed point (center of rotation and scaling) for the twist, and the <span style="color: orange;">diagonal orange arrow</span> shows the period direction $(\ln(\text{zoom}), 2\pi)$ that will be rotated and scaled into a vertical line. See the video's "Complex Logarithm" section starting at 25:56.
1.  **Twisted Map**: We apply the "perfect" twist $w' = c \cdot (w - w_0) + w_0$ around the fixed point $w_0$, where $c = \frac{2\pi i}{\ln(\text{zoom}) + 2\pi i}$, rotating and scaling the <span style="color: orange;">orange arrow</span> to be vertical so the repeating strips align for a seamless spiral.
1.  **Final Droste**: We apply the inverse transform $z = e^{w'}$, mapping the twisted grid back to a spiral.

<div id="texture-selector" style="margin-bottom: 15px; text-align: left; display: flex; align-items: center; gap: 20px;">
  <div>
    <label for="texture-select"><strong>Select Input Image:</strong></label>
    <select id="texture-select" style="padding: 5px; border-radius: 4px; border: 1px solid #ccc;">
      <option value="/assets/image/grid.png">Grid</option>
      <option value="/assets/image/archery_target.png">Archery Target</option>
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
    <div class="panel-label">1. Input Image</div>
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
    <div class="panel-label">3. Log-polar Map ($\ln(z)$)</div>
  </div>
  <div class="panel-box">
    <div id="panel-1" class="droste-panel"></div>
    <div class="panel-label">2. Original Image ($z$)</div>
  </div>
  <div class="panel-box">
    <div id="panel-3" class="droste-panel"></div>
    <div class="panel-label">4. Twisted Map ($w' = c \cdot (w - w_0) + w_0$)</div>
  </div>
  <div class="panel-box">
    <div id="panel-4" class="droste-panel"></div>
    <div class="panel-label">5. Final Droste ($e^{w'}$)</div>
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
