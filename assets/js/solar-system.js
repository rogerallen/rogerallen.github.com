//
// Solar system simulator
//
// FIXME
// [ ] stats in upperleft
// [ ] orbit "above" planets

import * as THREE from "/assets/js/modules/r150/three.module.js";
import { GUI } from "/assets/js/modules/0.7.9/dat.gui.module.js";
import Stats from "/assets/js/modules/r150/stats.module.js";

var dim = 512;
var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(-1, 1, -1, 1, -1, 1);
var renderer = new THREE.WebGLRenderer({
    antialias: true,
    depth: true,
    depthBuffer: true,
});
var stats = Stats();
const gui = new GUI();

class Planet {
    constructor(radius, distance, textureFile) {
        this.radius = radius;
        this.distance = distance;
        this.textureFile = textureFile;
        this.system = new THREE.Group();

        const geometry = new THREE.SphereGeometry(this.radius);
        const texture = new THREE.TextureLoader().load(this.textureFile);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = - Math.PI / 2;
        this.mesh.position.x += this.distance;
        this.system.add(this.mesh);

        if (distance > 0.0) {

            const curve = new THREE.EllipseCurve(
                0, 0,               // ax, aY
                distance, distance, // xRadius, yRadius
                0, 2 * Math.PI,     // aStartAngle, aEndAngle
                false,              // aClockwise
                0                   // aRotation
            );

            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
            const orbit = new THREE.Line(geometry, material);
            this.system.add(orbit);
        }
    }
}

const sun = new Planet(0.1, 0.0, "/assets/image/sun.jpeg");
const earth = new Planet(0.05, 0.5, "/assets/image/earth.jpeg");
const mars = new Planet(0.04, 0.5 * 1.524, "/assets/image/mars.jpeg");

function initCanvas() {
    renderer.setSize(dim, dim);
    renderer.setClearColor(0x222222);
    var div = document.getElementById("view");
    div.appendChild(renderer.domElement);
    div.appendChild(stats.dom); // FIXME -- mke relative to div, not top page

    const solarSystem = new THREE.Group();

    solarSystem.add(sun.system);
    solarSystem.add(earth.system);
    solarSystem.add(mars.system);

    scene.add(solarSystem);
}

function render() {
    renderer.render(scene, camera);
}

function animate() {
    const SPEED = 4;
    const EARTH_YEAR = 2 * Math.PI * (1 / 60) * (1 / 60) * SPEED;
    const EARTH_DAY = EARTH_YEAR * 10;
    const MARS_YEAR = (365 / 687) * EARTH_YEAR;
    const MARS_DAY = MARS_YEAR * 10;
    requestAnimationFrame(animate);
    earth.system.rotation.z -= EARTH_YEAR;
    earth.mesh.rotation.y -= EARTH_DAY;
    mars.system.rotation.z -= MARS_YEAR;
    mars.mesh.rotation.y -= MARS_DAY;
    render()
    stats.update();
}

initCanvas();
animate();
