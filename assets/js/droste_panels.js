import * as THREE from './modules/r150/three.module.js';

async function init() {
    const panels = [
        { id: 'panel-0', mode: 1 }, // Raw Image
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
        uResolution: { value: new THREE.Vector2(512, 512) }
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
                uMode: { value: panel.mode }
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
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    panel3.container.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;

        uniforms.uRotation.value += deltaX * 0.01;
        uniforms.uScale.value *= Math.exp(deltaY * -0.01);

        apps.forEach(app => {
            app.material.uniforms.uRotation.value = uniforms.uRotation.value;
            app.material.uniforms.uScale.value = uniforms.uScale.value;
        });
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Touch support
    panel3.container.addEventListener('touchstart', (e) => {
        isDragging = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - lastX;
        const deltaY = e.touches[0].clientY - lastY;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;

        uniforms.uRotation.value += deltaX * 0.01;
        uniforms.uScale.value *= Math.exp(deltaY * -0.01);

        apps.forEach(app => {
            app.material.uniforms.uRotation.value = uniforms.uRotation.value;
            app.material.uniforms.uScale.value = uniforms.uScale.value;
        });
        e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchend', () => {
        isDragging = false;
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
