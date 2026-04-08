import * as THREE from './modules/r150/three.module.js';

async function init() {
    const panels = [
        { id: 'panel-0', mode: 0 }, // Raw Image
        { id: 'panel-2', mode: 2 }, // Log-polar
        { id: 'panel-1', mode: 1 }, // Original
        { id: 'panel-3', mode: 3 }, // Transform
        { id: 'panel-4', mode: 4 }  // Final
    ];

    const textureLoader = new THREE.TextureLoader();
    const textures = {
        '/assets/image/archery_target.png': await textureLoader.loadAsync('/assets/image/archery_target.png'),
        '/assets/image/grid.png': await textureLoader.loadAsync('/assets/image/grid.png'),
        '/assets/image/uhrenmacher.jpg': await textureLoader.loadAsync('/assets/image/uhrenmacher.jpg')
    };

    // Configure textures
    Object.values(textures).forEach(tex => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
    });

    const fragShader = await fetch('/assets/js/droste_panels.frag').then(r => r.text());
    
    const uniforms = {
        tDiffuse: { value: textures['/assets/image/archery_target.png'] },
        uMode: { value: 1 },
        uRotation: { value: 0.0 },
        uScale: { value: 1.0 },
        uTime: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(512, 512) },
        uPoint: { value: new THREE.Vector2(0.5, 0.5) },
        uPoint0: { value: new THREE.Vector2(0.5 + Math.cos(0.5) * 0.2 / Math.PI, 0.5 + Math.sin(0.5) * 0.2 / Math.PI) },
        uRadius: { value: 0.2 },
        uZoom: { value: 4.0 }
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

    const updateTextures = (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        uniforms.tDiffuse.value = tex;
        apps.forEach(app => {
            app.material.uniforms.tDiffuse.value = tex;
        });
    };

    // Texture Selector Logic
    const textureSelect = document.getElementById('texture-select');
    textureSelect.addEventListener('change', (e) => {
        const selectedTex = textures[e.target.value];
        if (selectedTex) {
            updateTextures(selectedTex);
        }
    });

    // Texture Upload Logic
    const textureUpload = document.getElementById('texture-upload');
    textureUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            textureLoader.load(url, (tex) => {
                updateTextures(tex);
                // Optionally clear the select menu choice
                textureSelect.value = "";
            });
        }
    });

    // Interactivity on Panel 3
    const panel3 = apps.find(app => app.id === 'panel-3');
    let isDragging3 = false;
    let lastX3 = 0;
    let lastY3 = 0;

    // Interaction on Panel 0 and 1 (Original Images)
    const interactionPanels = apps.filter(app => app.id === 'panel-0' || app.id === 'panel-1');
    let activeInteractionPanel = null;
    let isMovingPoint = false;
    let isMovingPoint0 = false;

    // Zoom Selector Logic
    const zoomSelect = document.getElementById('zoom-select');
    zoomSelect.addEventListener('change', (e) => {
        uniforms.uZoom.value = parseFloat(e.target.value);
        syncUniforms();
    });

    function updateRadius(uvX, uvY) {
        const dx = uvX - uniforms.uPoint.value.x;
        const dy = uvY - uniforms.uPoint.value.y;
        let radius = Math.sqrt(dx * dx + dy * dy);
        const px = uniforms.uPoint.value.x;
        const py = uniforms.uPoint.value.y;
        const maxRadius = Math.min(px, 1.0 - px, py, 1.0 - py);
        uniforms.uRadius.value = Math.min(radius, maxRadius);
        syncUniforms();
    }

    function updatePoint(uvX, uvY) {
        const px = Math.max(0.01, Math.min(0.99, uvX));
        const py = Math.max(0.01, Math.min(0.99, uvY));

        // Move blue point relatively
        uniforms.uPoint0.value.x += (px - uniforms.uPoint.value.x);
        uniforms.uPoint0.value.y += (py - uniforms.uPoint.value.y);

        uniforms.uPoint.value.set(px, py);
        const maxRadius = Math.min(px, 1.0 - px, py, 1.0 - py);
        uniforms.uRadius.value = Math.min(uniforms.uRadius.value, maxRadius);
        syncUniforms();
    }

    function updatePoint0(uvX, uvY) {
        uniforms.uPoint0.value.set(uvX, uvY);
        syncUniforms();
    }

    function syncUniforms() {
        apps.forEach(app => {
            app.material.uniforms.uPoint.value.copy(uniforms.uPoint.value);
            app.material.uniforms.uPoint0.value.copy(uniforms.uPoint0.value);
            app.material.uniforms.uRadius.value = uniforms.uRadius.value;
            app.material.uniforms.uZoom.value = uniforms.uZoom.value;
        });
    }

    interactionPanels.forEach(app => {
        app.container.style.cursor = 'crosshair';
        app.container.addEventListener('mousedown', (e) => {
            activeInteractionPanel = app;
            const rect = app.container.getBoundingClientRect();
            const uvX = (e.clientX - rect.left) / rect.width;
            const uvY = 1.0 - (e.clientY - rect.top) / rect.height;

            const distToPoint = Math.sqrt(Math.pow(uvX - uniforms.uPoint.value.x, 2) + Math.pow(uvY - uniforms.uPoint.value.y, 2));
            const distToPoint0 = Math.sqrt(Math.pow(uvX - uniforms.uPoint0.value.x, 2) + Math.pow(uvY - uniforms.uPoint0.value.y, 2));

            if (distToPoint0 < 0.05) {
                isMovingPoint = false;
                isMovingPoint0 = true;
            } else if (distToPoint < 0.05) {
                isMovingPoint = true;
                isMovingPoint0 = false;
            } else {
                isMovingPoint = false;
                isMovingPoint0 = false;
                updateRadius(uvX, uvY);
            }
        });
    });

    panel3.container.addEventListener('mousedown', (e) => {
        isDragging3 = true;
        lastX3 = e.clientX;
        lastY3 = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
        if (isDragging3) {
            const deltaX = e.clientX - lastX3;
            const deltaY = e.clientY - lastY3;
            lastX3 = e.clientX;
            lastY3 = e.clientY;

            uniforms.uRotation.value += deltaX * 0.01;
            uniforms.uScale.value *= Math.exp(deltaY * -0.01);

            apps.forEach(app => {
                app.material.uniforms.uRotation.value = uniforms.uRotation.value;
                app.material.uniforms.uScale.value = uniforms.uScale.value;
            });
        } else if (activeInteractionPanel) {
            const rect = activeInteractionPanel.container.getBoundingClientRect();
            const uvX = (e.clientX - rect.left) / rect.width;
            const uvY = 1.0 - (e.clientY - rect.top) / rect.height;

            if (isMovingPoint) {
                updatePoint(uvX, uvY);
            } else if (isMovingPoint0) {
                updatePoint0(uvX, uvY);
            } else {
                updateRadius(uvX, uvY);
            }
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging3 = false;
        activeInteractionPanel = null;
        isMovingPoint = false;
        isMovingPoint0 = false;
    });

    // Touch support for Panel 3
    panel3.container.addEventListener('touchstart', (e) => {
        isDragging3 = true;
        lastX3 = e.touches[0].clientX;
        lastY3 = e.touches[0].clientY;
        e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging3) return;
        const deltaX = e.touches[0].clientX - lastX3;
        const deltaY = e.touches[0].clientY - lastY3;
        lastX3 = e.touches[0].clientX;
        lastY3 = e.touches[0].clientY;

        uniforms.uRotation.value += deltaX * 0.01;
        uniforms.uScale.value *= Math.exp(deltaY * -0.01);

        apps.forEach(app => {
            app.material.uniforms.uRotation.value = uniforms.uRotation.value;
            app.material.uniforms.uScale.value = uniforms.uScale.value;
        });
        e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchend', () => {
        isDragging3 = false;
    });

    function animate(time) {
        requestAnimationFrame(animate);
        const t = time * 0.001;
        uniforms.uTime.value = t;

        apps.forEach(app => {
            app.renderer.render(app.scene, app.camera);
        });
    }

    animate(0);
}

init();
