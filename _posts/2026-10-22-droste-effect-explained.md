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
1.  **Final Droste**: We apply the inverse transform $z' = e^{w'}$, mapping the twisted grid back to a spiral.

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
    <div class="panel-label">3. Log-polar Map ($w = \ln(z)$)</div>
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
    <div class="panel-label">5. Final Droste ($z' = e^{w'}$)</div>
  </div>
</div>

### Mathematical Summary

Let $Z$ be the Droste zoom factor ($2, 4, 8, \dots$) and $L = \ln(Z)$ be the logarithmic width of one zoom cycle.

#### 1. The Forward Pipeline (Video Perspective)

In the video, we think of pushing points **forward** from the original image $z$ to the final Droste image $z'$:

1. **Crop to the $z$-plane**: Map the selected circle of radius $R$ centered at $u_{\text{center}}$ in the input image to the complex disk $\lvert z \rvert \le \pi$. The annulus between the inner dotted circle and outer solid circle is $\frac{\pi}{Z} \le \lvert z \rvert \le \pi$, and we choose a fixed point $z_0$ inside this region.
2. **Complex Logarithm ($z \mapsto w$)**: Unroll the annulus into a vertical strip in the log-polar plane:

   $$w = \ln(z) = \ln\lvert z \rvert + i\arg(z), \quad w_0 = \ln(z_0)$$

   Tiling the annulus infinitely in all directions repeats this strip horizontally every $L$ and vertically every $2\pi$.
3. **Twist Transformation ($w \mapsto w'$)**: Rotate and scale the tiled $w$-plane around the fixed point $w_0$ so that the diagonal period vector $L + 2\pi i$ is mapped onto the vertical period vector $2\pi i$:

   $$w' = c \cdot (w - w_0) + w_0, \quad \text{where } c = \frac{2\pi i}{L + 2\pi i}$$

4. **Complex Exponential ($w' \mapsto z'$)**: Wrap the twisted strip back into the complex plane:

   $$z' = e^{w'} = e^{\text{Re}(w')}\left(\cos(\text{Im}(w')) + i\sin(\text{Im}(w'))\right)$$

   Because $w'$ now repeats vertically with period $2\pi i$ across adjacent zoom strips, $e^{w'}$ connects them into a continuous, seamless spiral.

#### 2. The Reverse Pipeline (Fragment Shader Perspective)

In WebGL, a fragment shader runs per output pixel and must work **in reverse** — starting from a destination pixel coordinate and working backward to look up a color in the input texture:

1. **Screen Pixel to Complex $z'$**: Map the normalized fragment coordinate $\text{uv} \in [0, 1]^2$ to $[-\pi, \pi]^2$:

   $$z' = (\text{uv} \cdot 2 - 1)\pi$$

2. **Unroll to the Twisted Plane ($z' \mapsto w'$)**: Apply the complex logarithm to find where this output pixel sits in the twisted plane:

   $$w' = \ln(z') = \ln\lvert z' \rvert + i\operatorname{atan2}(z'_y, z'_x)$$

3. **Inverse Twist ($w' \mapsto w$)**: Invert the twist transformation by dividing by $c$ around $w_0 = \ln(z_0)$ to recover the untwisted log-polar coordinate $w$:

   $$w = \frac{w' - w_0}{c} + w_0, \quad \text{where } c = \frac{2\pi i}{L + 2\pi i}$$

4. **Periodic Tiling ($\bmod$ into the Fundamental Annulus)**: Wrap $w$ back into the single source strip $\text{Re}(w) \in [\ln(\pi) - L, \ln(\pi)]$, $\text{Im}(w) \in [-\pi, \pi]$:

   $$w_x \leftarrow \operatorname{mod}(w_x - \ln\pi,\; L) + \ln\pi - L$$

   $$w_y \leftarrow \operatorname{mod}(w_y + \pi,\; 2\pi) - \pi$$

5. **Map Back to Input Texture ($w \mapsto z \mapsto \text{uv}_{\text{sample}}$)**: Exponentiate $w$ back to the cropped $z$-plane and scale into the input texture's UV space:

   $$z = e^w, \quad \text{uv}_{\text{sample}} = u_{\text{center}} + \frac{z}{\pi} \cdot R$$

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
