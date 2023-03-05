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
const gui = new GUI({ autoplace: false });

class Controls {
    constructor() {
        this.speed = 4;
    }
}
var controls = new Controls();

gui.add(controls, "speed", 0.1, 10.0, 0.1).name("speed");

class Planet {
    constructor(radius, distance, textureFile) {
        this.radius = radius;
        this.distance = distance;
        this.angle = 0;
        this.x = this.distance * Math.cos(this.angle);
        this.y = this.distance * Math.sin(this.angle);
        this.textureFile = textureFile;
        this.system = new THREE.Group();

        const geometry = new THREE.SphereGeometry(this.radius);
        const texture = new THREE.TextureLoader().load(this.textureFile);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = - Math.PI / 2;
        this.mesh.position.x += this.distance;
        this.system.add(this.mesh);

        // add the orbit here, too
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

    rotateAroundSun(delta) {
        this.angle -= delta;
        this.system.rotation.z -= delta;
        this.x = this.distance * Math.cos(this.angle);
        this.y = this.distance * Math.sin(this.angle);
    }

    rotateOnAxis(delta) {
        this.mesh.rotation.y -= delta;
    }
}

class PlanetLine {
    constructor(p0, p1) {
        this.p0 = p0;
        this.p1 = p1;
        this.system = new THREE.Group();

        const material = new THREE.LineBasicMaterial({ color: 0x4444dd });
        const points = [];
        points.push(new THREE.Vector3(this.p0.x, this.p0.y, 0));
        points.push(new THREE.Vector3(this.p1.x, this.p1.y, 0));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        this.line = new THREE.Line(geometry, material);
        this.system.add(this.line);
    }

    update() {
        this.line.geometry.attributes.position.needsUpdate = true;
        const positions = this.line.geometry.attributes.position.array;

        positions[0] = this.p0.x;
        positions[1] = this.p0.y;

        const dx = this.p1.x - this.p0.x;
        const dy = this.p1.y - this.p0.y;
        const x = this.p0.x + dx * 4;
        const y = this.p0.y + dy * 4;

        positions[3] = x;
        positions[4] = y;

    }
}

const sun = new Planet(0.1, 0.0, "/assets/image/sun.jpeg");
const earth = new Planet(0.05, 0.5, "/assets/image/earth.jpeg");
const mars = new Planet(0.04, 0.5 * 1.524, "/assets/image/mars.jpeg");
const earth_mars = new PlanetLine(earth, mars);

function initCanvas() {
    renderer.setSize(dim, dim);
    renderer.setClearColor(0x222222);
    var div = document.getElementById("view");
    div.appendChild(gui.domElement)
    div.appendChild(stats.domElement); // FIXME -- mke relative to div, not top page
    div.appendChild(renderer.domElement);

    const solarSystem = new THREE.Group();

    solarSystem.add(sun.system);
    solarSystem.add(earth.system);
    solarSystem.add(mars.system);
    solarSystem.add(earth_mars.system);

    scene.add(solarSystem);
}

function render() {
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate);

    const EARTH_YEAR_DELTA = 2 * Math.PI * (1 / 60) * (1 / 60) * controls.speed;
    const EARTH_DAY_DELTA = EARTH_YEAR_DELTA * 10;
    const MARS_YEAR_DELTA = (365 / 687) * EARTH_YEAR_DELTA;
    const MARS_DAY_DELTA = MARS_YEAR_DELTA * 10;
    earth.rotateAroundSun(EARTH_YEAR_DELTA);
    earth.rotateOnAxis(EARTH_DAY_DELTA);
    mars.rotateAroundSun(MARS_YEAR_DELTA);
    mars.rotateOnAxis(MARS_DAY_DELTA);
    earth_mars.update();

    render()
    stats.update();
}

initCanvas();
animate();
