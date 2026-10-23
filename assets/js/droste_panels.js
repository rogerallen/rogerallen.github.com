import * as THREE from "./modules/r150/three.module.js";

async function init() {
  const panels = [
    { id: "panel-0", mode: 0 }, // MODE_INPUT
    { id: "panel-1", mode: 1 }, // MODE_SELECTED
    { id: "panel-2", mode: 2 }, // MODE_LOG_POLAR
    { id: "panel-3", mode: 3 }, // MODE_TWISTED
    { id: "panel-4", mode: 4 }, // MODE_DROSTE
  ];

  const textureLoader = new THREE.TextureLoader();
  const textures = {
    "/assets/image/gemini-droste-2.jpg": await textureLoader.loadAsync(
      "/assets/image/gemini-droste-2.jpg",
    ),
    "/assets/image/gemini-droste-1.jpg": await textureLoader.loadAsync(
      "/assets/image/gemini-droste-1.jpg",
    ),
    "/assets/image/grid.png": await textureLoader.loadAsync(
      "/assets/image/grid.png",
    ),
    "/assets/image/archery_target.png": await textureLoader.loadAsync(
      "/assets/image/archery_target.png",
    ),
    "/assets/image/uhrenmacher.jpg": await textureLoader.loadAsync(
      "/assets/image/uhrenmacher.jpg",
    ),
  };

  // Configure textures for tiling
  Object.values(textures).forEach((tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  });

  const fragShader = await fetch("/assets/js/droste_panels.frag").then((r) =>
    r.text(),
  );

  // Global State (Uniforms)
  const initialTexture =
    document.getElementById("texture-select")?.value ||
    "/assets/image/gemini-droste-2.jpg";
  const uniforms = {
    tDiffuse: { value: textures[initialTexture] },
    uCenterUV: { value: new THREE.Vector2(0.5, 0.5) },
    uFixedPointUV: { value: new THREE.Vector2(0.42, 0.26) },
    uSelectionRadius: { value: 0.5 },
    uZoomFactor: { value: 4.0 },
  };

  const geometry = new THREE.PlaneGeometry(2, 2);

  const apps = panels.map((panel) => {
    const container = document.getElementById(panel.id);
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height, false);
    container.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        ...uniforms,
        uMode: { value: panel.mode },
        uResolution: { value: new THREE.Vector2(width, height) },
      },
      vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
      fragmentShader: fragShader,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return { scene, camera, renderer, material, container, id: panel.id };
  });

  // Helper: Sync all panel uniforms
  function syncUniforms() {
    apps.forEach((app) => {
      Object.keys(uniforms).forEach((key) => {
        if (app.material.uniforms[key]) {
          if (uniforms[key].value.clone) {
            app.material.uniforms[key].value.copy(uniforms[key].value);
          } else {
            app.material.uniforms[key].value = uniforms[key].value;
          }
        }
      });
    });
  }

  const updateTextures = (tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    uniforms.tDiffuse.value = tex;
    syncUniforms();
  };

  // --- Interaction Logic ---

  // 1. Texture Selection
  document.getElementById("texture-select").addEventListener("change", (e) => {
    const selectedTex = textures[e.target.value];
    if (selectedTex) updateTextures(selectedTex);
  });

  document.getElementById("texture-upload").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      textureLoader.load(url, updateTextures);
      document.getElementById("texture-select").value = "";
    }
  });

  // 2. Selection Interaction (Panel 0) & Twist Fixed Point Interaction (Panel 1)
  let activeSourcePanel = null;
  let dragMode = null; // 'center', 'fixed', 'zoom', or 'radius'
  const zoomDisplay = document.getElementById("zoom-display");

  function getEventUV(e, container) {
    const point = e.touches && e.touches.length > 0 ? e.touches[0] : e;
    const rect = container.getBoundingClientRect();
    const uvX = (point.clientX - rect.left) / rect.width;
    const uvY = 1.0 - (point.clientY - rect.top) / rect.height;
    return { uvX, uvY };
  }

  const sourcePanels = apps.filter((app) => app.id === "panel-0");
  sourcePanels.forEach((app) => {
    app.container.style.cursor = "crosshair";
    app.container.style.touchAction = "none";
    app.renderer.domElement.style.touchAction = "none";

    const onStart = (e) => {
      if (e.cancelable) e.preventDefault();
      activeSourcePanel = app;
      const { uvX, uvY } = getEventUV(e, app.container);

      const distToCenter = uniforms.uCenterUV.value.distanceTo(
        new THREE.Vector2(uvX, uvY),
      );
      const outerRadius = uniforms.uSelectionRadius.value;
      const innerRadius = outerRadius / uniforms.uZoomFactor.value;
      const centerThreshold = Math.min(0.05, innerRadius * 0.6);

      if (distToCenter < centerThreshold) {
        dragMode = "center";
      } else if (
        Math.abs(distToCenter - innerRadius) <
        Math.abs(distToCenter - outerRadius)
      ) {
        dragMode = "zoom";
        updateZoom(uvX, uvY);
      } else {
        dragMode = "radius";
        updateRadius(uvX, uvY);
      }
    };

    app.container.addEventListener("mousedown", onStart);
    app.container.addEventListener("touchstart", onStart, { passive: false });
  });

  const selectedPanels = apps.filter((app) => app.id === "panel-1");
  selectedPanels.forEach((app) => {
    app.container.style.cursor = "crosshair";
    app.container.style.touchAction = "none";
    app.renderer.domElement.style.touchAction = "none";

    const onStart = (e) => {
      if (e.cancelable) e.preventDefault();
      activeSourcePanel = app;
      dragMode = "fixed";
      const { uvX, uvY } = getEventUV(e, app.container);
      updateFixedPoint(uvX, uvY);
    };

    app.container.addEventListener("mousedown", onStart);
    app.container.addEventListener("touchstart", onStart, { passive: false });
  });

  function updateFixedPoint(uvX, uvY) {
    const outerR = 0.5;
    const innerR = outerR / uniforms.uZoomFactor.value;
    let dx = uvX - 0.5;
    let dy = uvY - 0.5;
    let dist = Math.hypot(dx, dy);
    if (dist < 1e-6) {
      dx = 1.0;
      dy = 0.0;
      dist = 1.0;
    }
    const clampedDist = Math.max(innerR, Math.min(outerR, dist));
    const px = 0.5 + (dx / dist) * clampedDist;
    const py = 0.5 + (dy / dist) * clampedDist;
    uniforms.uFixedPointUV.value.set(px, py);
    syncUniforms();
  }

  function updateZoom(uvX, uvY) {
    const innerRadius = Math.max(
      1e-6,
      uniforms.uCenterUV.value.distanceTo(new THREE.Vector2(uvX, uvY)),
    );
    const zoom = uniforms.uSelectionRadius.value / innerRadius;
    const clampedZoom = Math.max(1.1, Math.min(32.0, zoom));
    uniforms.uZoomFactor.value = clampedZoom;
    if (zoomDisplay) {
      zoomDisplay.textContent = `${clampedZoom.toFixed(1)}x`;
    }
    updateFixedPoint(
      uniforms.uFixedPointUV.value.x,
      uniforms.uFixedPointUV.value.y,
    );
  }

  function updateRadius(uvX, uvY) {
    const radius = uniforms.uCenterUV.value.distanceTo(
      new THREE.Vector2(uvX, uvY),
    );
    const px = uniforms.uCenterUV.value.x;
    const py = uniforms.uCenterUV.value.y;
    const maxRadius = Math.min(px, 1.0 - px, py, 1.0 - py);
    uniforms.uSelectionRadius.value = Math.max(
      0.05,
      Math.min(radius, maxRadius),
    );
    syncUniforms();
  }

  function updateCenter(uvX, uvY) {
    const px = Math.max(0.05, Math.min(0.95, uvX));
    const py = Math.max(0.05, Math.min(0.95, uvY));
    uniforms.uCenterUV.value.set(px, py);

    // Constrain radius
    const maxRadius = Math.min(px, 1.0 - px, py, 1.0 - py);
    uniforms.uSelectionRadius.value = Math.min(
      uniforms.uSelectionRadius.value,
      maxRadius,
    );
    syncUniforms();
  }

  // Global Mouse & Touch Handlers
  const onMove = (e) => {
    if (activeSourcePanel) {
      if (e.cancelable) e.preventDefault();
      const { uvX, uvY } = getEventUV(e, activeSourcePanel.container);

      if (dragMode === "center") updateCenter(uvX, uvY);
      else if (dragMode === "fixed") updateFixedPoint(uvX, uvY);
      else if (dragMode === "zoom") updateZoom(uvX, uvY);
      else if (dragMode === "radius") updateRadius(uvX, uvY);
    }
  };

  const onEnd = () => {
    activeSourcePanel = null;
    dragMode = null;
  };

  window.addEventListener("mousemove", onMove);
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("mouseup", onEnd);
  window.addEventListener("touchend", onEnd);
  window.addEventListener("touchcancel", onEnd);

  let lastWindowWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth === lastWindowWidth) return;
    lastWindowWidth = window.innerWidth;
    apps.forEach((app) => {
      const width = app.container.clientWidth;
      const height = app.container.clientHeight;
      app.renderer.setSize(width, height, false);
      app.material.uniforms.uResolution.value.set(width, height);
    });
  });

  // --- Render Loop ---
  function animate() {
    requestAnimationFrame(animate);
    apps.forEach((app) => {
      app.renderer.render(app.scene, app.camera);
    });
  }
  animate();
}

init();
