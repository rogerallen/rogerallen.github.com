---
layout: post
title: "Rendering The Droste Effect"
description: "A mathematical journey into rendering the Droste effect."
category: webgl
tags: [webgl, threejs, math, droste]
---

The [Droste effect](https://en.wikipedia.org/wiki/Droste_effect) is a recursive image where a smaller version of the image appears within itself. While it often looks like a simple zoom, the most fascinating versions involve a "twist" or spiral. Probably the most famous is [M. C. Escher's "Print Gallery"](https://pub.math.leidenuniv.nl/~smitbde/escherdroste/).

I have always thought it would be fun to create these kinds of images myself, and being a graphics guy, why not write a WebGL shader to do this? There are a variety of tutorials and even software products that can manipulate your images, but creating these images in realtime is a fun challenge.

I attempted to follow the explanation from that Leiden University site to render the Droste effect via WebGL in my earlier [2014 Droste Effect Experiment](/webgl/2014/02/03/droste-effect-experiment) post. While I did get it "working", I can't say I really understood it. Finally, after watching this **excellent [3Blue1Brown video](https://www.youtube.com/watch?v=ldxFjLJ3rVY)**, I believe I understand the math well enough to (yes, with some AI help) create an interactive WebGL implementation.

The thing that makes it conceptually difficult is, first, this is a complicated enough concept that it takes 45 minutes for an expert to explain it in four separate steps involving exponentials & logarithms. Then, in order to apply this in a WebGL context inside your browser, you need to reverse those steps and also project this onto a texture image with 0-1 coordinates.

This post relies completely on concepts from the video and I'm not going to attempt to re-explain them. So, go watch the video if you haven't. This post won't make much sense without watching.

### Mathematical Summary

First, we will summarize the steps as presented in the video. We'll call this _The Forward Pipeline_.

#### 1. The Forward Pipeline

In the video, we think of pushing points **forward** from the original image $z$ (see [**1. Input Image**](#panel-0) below) to the final Droste image $z'$ (see [**5. Final Droste Image**](#panel-4) below):

Preliminaries:

- We have an _outer selected circle_ which is a circle of radius $R$ centered at $u_{\text{center}}$ in the input image $z$.
- Let $Z$ be the Droste zoom factor ($2, 4, 8, \dots$). In the video, Grant used 16. $L = \ln(Z)$ will be the logarithmic width of one zoom cycle.
- We have an _inner selected circle_ that has a radius of $R / Z$ and is also centered at $u_{\text{center}}$ in the input image $z$.
- Inside the annulus between the _inner selected circle_ and _outer selected circle_ we choose a fixed point $z_0$ as a _pivot point_.

1. **Crop to the $z$-plane (see [2. Selected Image](#panel-1))**: Map the selected image to the complex disk $\lvert z \rvert \le \pi$. The annulus between the _inner selected circle_ and _outer selected circle_ is $\frac{\pi}{Z} \le \lvert z \rvert \le \pi$.

2. **Complex Logarithm ($z \mapsto w$) (see [3. Log-polar Map](#panel-2))**: Unroll the annulus into a vertical strip in the log-polar plane:

   $$w = \ln(z) = \ln\lvert z \rvert + i\arg(z), \quad w_0 = \ln(z_0)$$

   Tiling the annulus infinitely in all directions repeats this strip horizontally every $L$ and vertically every $2\pi$.

3. **Twist Transformation ($w \mapsto w'$) (see [4. Twisted Map](#panel-3))**: Rotate and scale the tiled $w$-plane around the fixed point $w_0$ so that the diagonal period vector $L + 2\pi i$ is mapped onto the vertical period vector $2\pi i$:

   $$w' = c \cdot (w - w_0) + w_0, \quad \text{where } c = \frac{2\pi i}{L + 2\pi i}$$

4. **Complex Exponential ($w' \mapsto z'$) (see [5. Final Droste Image](#panel-4))**: Wrap the twisted strip back into the complex plane:

   $$z' = e^{w'} = e^{\text{Re}(w')}\left(\cos(\text{Im}(w')) + i\sin(\text{Im}(w'))\right)$$

   Because $w'$ now repeats vertically with period $2\pi i$ across adjacent zoom strips, $e^{w'}$ connects them into a continuous, seamless spiral.

#### 2. The Reverse Pipeline (Fragment Shader Perspective)

In WebGL, a fragment shader runs per output pixel and must work **in reverse** — starting from a destination pixel coordinate and working backward to look up a color in the input texture. Note that each of the images displayed below goes through only its portion of this pipeline. E.g., the final image goes through all these stages 1-5, but the prior image just goes through 3-5.

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

### The Result

Below are five panels showing the transformation process. 2-5 are in the order specified in the YouTube video. I added panel 1 to show an original image that we can select within.

1.  **Select the input image** from the dropdown or upload your own image.
1.  Within the **1. Input Image**, use the following controls to select the portion used:
    1. adjust the <span style="color: orange;">orange circular region</span> that we can read,
    1. the <span style="color: orange;">orange point</span> is the center, which you can move around, and
    1. the <span style="color: orange;">dotted orange circle</span> shows the selected zoom factor which is controlled via the **Droste Zoom** dropdown.

1.  Within the **2. Selected Image**: Click and drag the interactive <span style="color: green;">green point</span> ($z_0$) here to choose the fixed point for the twist.
1.  Watch the results move through the pipeline. In **3. Log-polar Map** and **4. Twisted Map**, note the <span style="color: green;">green point</span> ($w_0$) is projected along with an <span style="color: orange;">orange vector</span> that we rotate and scale for the twist to produce **5. Final Droste Image**.

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
    <div class="panel-label">3. Log-polar Map</div>
  </div>
  <div class="panel-box">
    <div id="panel-1" class="droste-panel"></div>
    <div class="panel-label">2. Selected Image</div>
  </div>
  <div class="panel-box">
    <div id="panel-3" class="droste-panel"></div>
    <div class="panel-label">4. Twisted Map</div>
  </div>
  <div class="panel-box">
    <div id="panel-4" class="droste-panel"></div>
    <div class="panel-label">5. Final Droste Image</div>
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
