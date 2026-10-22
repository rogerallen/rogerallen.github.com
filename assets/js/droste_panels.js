import * as THREE from './modules/r150/three.module.js';

async function init() {
    const panels = [
        { id: 'panel-0', mode: 0 }, // MODE_RAW
        { id: 'panel-1', mode: 1 }, // MODE_ORIGINAL
        { id: 'panel-2', mode: 2 }, // MODE_LOG_POLAR
        { id: 'panel-3', mode: 3 }, // MODE_TRANSFORM
        { id: 'panel-4', mode: 4 }  // MODE_DROSTE
    ];

    const textureLoader = new THREE.TextureLoader();
    const textures = {
        '/assets/image/archery_target.png': await textureLoader.loadAsync('/assets/image/archery_target.png'),
        '/assets/image/grid.png': await textureLoader.loadAsync('/assets/image/grid.png'),
        '/assets/image/uhrenmacher.jpg': await textureLoader.loadAsync('/assets/image/uhrenmacher.jpg')
    };

    // Configure textures for tiling
    Object.values(textures).forEach(tex => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
    });

    const fragShader = await fetch('/assets/js/droste_panels.frag').then(r => r.text());
    
    // Global State (Uniforms)
    const initialTexture = document.getElementById('texture-select')?.value || '/assets/image/grid.png';
    const uniforms = {
        tDiffuse:             { value: textures[initialTexture] },
        uCenterUV:            { value: new THREE.Vector2(0.5, 0.5) },
        uFixedPointUV:        { value: new THREE.Vector2(0.55, 0.5) },
        uSelectionRadius:     { value: 0.2 },
        uZoomFactor:          { value: 4.0 },
        uTweakReal:           { value: 0.0 },
        uTweakImag:           { value: 0.0 }
    };

    const geometry = new THREE.PlaneGeometry(2, 2);

    const apps = panels.map(panel => {
        const container = document.getElementById(panel.id);
        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                ...uniforms,
                uMode: { value: panel.mode },
                uResolution: { value: new THREE.Vector2(width, height) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: fragShader
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        return { scene, camera, renderer, material, container, id: panel.id };
    });

    // Helper: Sync all panel uniforms
    function syncUniforms() {
        apps.forEach(app => {
            Object.keys(uniforms).forEach(key => {
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
    document.getElementById('texture-select').addEventListener('change', (e) => {
        const selectedTex = textures[e.target.value];
        if (selectedTex) updateTextures(selectedTex);
    });

    document.getElementById('texture-upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            textureLoader.load(url, updateTextures);
            document.getElementById('texture-select').value = "";
        }
    });

    // 2. Zoom Selection
    document.getElementById('zoom-select').addEventListener('change', (e) => {
        uniforms.uZoomFactor.value = parseFloat(e.target.value);
        syncUniforms();
    });

    // 2.5 Twist Tweaks
    const tweakRealSlider = document.getElementById('tweak-real-slider');
    const tweakRealValue = document.getElementById('tweak-real-value');
    tweakRealSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        uniforms.uTweakReal.value = value;
        tweakRealValue.innerText = value.toFixed(3);
        syncUniforms();
    });

    const tweakImagSlider = document.getElementById('tweak-imag-slider');
    const tweakImagValue = document.getElementById('tweak-imag-value');
    tweakImagSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        uniforms.uTweakImag.value = value;
        tweakImagValue.innerText = value.toFixed(3);
        syncUniforms();
    });

    // 3. Selection & Twist Center Interaction (Panel 0)
    let activeSourcePanel = null;
    let dragMode = null; // 'center', 'fixed', or 'radius'

    const sourcePanels = apps.filter(app => app.id === 'panel-0');
    sourcePanels.forEach(app => {
        app.container.style.cursor = 'crosshair';
        app.container.addEventListener('mousedown', (e) => {
            activeSourcePanel = app;
            const rect = app.container.getBoundingClientRect();
            const uvX = (e.clientX - rect.left) / rect.width;
            const uvY = 1.0 - (e.clientY - rect.top) / rect.height;

            const distToCenter = uniforms.uCenterUV.value.distanceTo(new THREE.Vector2(uvX, uvY));
            const distToFixed  = uniforms.uFixedPointUV.value.distanceTo(new THREE.Vector2(uvX, uvY));

            if (distToFixed < 0.05) {
                dragMode = 'fixed';
            } else if (distToCenter < 0.05) {
                dragMode = 'center';
            } else {
                dragMode = 'radius';
                updateRadius(uvX, uvY);
            }
        });
    });

    function updateRadius(uvX, uvY) {
        const radius = uniforms.uCenterUV.value.distanceTo(new THREE.Vector2(uvX, uvY));
        const px = uniforms.uCenterUV.value.x;
        const py = uniforms.uCenterUV.value.y;
        const maxRadius = Math.min(px, 1.0 - px, py, 1.0 - py);
        uniforms.uSelectionRadius.value = Math.min(radius, maxRadius);
        syncUniforms();
    }

    function updateCenter(uvX, uvY) {
        const px = Math.max(0.01, Math.min(0.99, uvX));
        const py = Math.max(0.01, Math.min(0.99, uvY));
        
        // Move fixed point relatively
        uniforms.uFixedPointUV.value.x += (px - uniforms.uCenterUV.value.x);
        uniforms.uFixedPointUV.value.y += (py - uniforms.uCenterUV.value.y);
        uniforms.uCenterUV.value.set(px, py);

        // Constrain radius
        const maxRadius = Math.min(px, 1.0 - px, py, 1.0 - py);
        uniforms.uSelectionRadius.value = Math.min(uniforms.uSelectionRadius.value, maxRadius);
        syncUniforms();
    }

    // Global Mouse Handlers
    window.addEventListener('mousemove', (e) => {
        if (activeSourcePanel) {
            const rect = activeSourcePanel.container.getBoundingClientRect();
            const uvX = (e.clientX - rect.left) / rect.width;
            const uvY = 1.0 - (e.clientY - rect.top) / rect.height;

            if (dragMode === 'center') updateCenter(uvX, uvY);
            else if (dragMode === 'fixed') {
                uniforms.uFixedPointUV.value.set(uvX, uvY);
                syncUniforms();
            }
            else if (dragMode === 'radius') updateRadius(uvX, uvY);
        }
    });

    window.addEventListener('mouseup', () => {
        activeSourcePanel = null;
        dragMode = null;
    });

    // --- Render Loop ---
    function animate() {
        requestAnimationFrame(animate);
        apps.forEach(app => {
            app.renderer.render(app.scene, app.camera);
        });
    }
    animate();
}

init();