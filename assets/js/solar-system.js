//
// Retrograde explorer / Solar system simulator
// Inspiration from https://github.com/SuboptimalEng/gamedex/tree/main/01-solar-system
//
// FIXME
// [ ] stats in upperleft
// [ ] orbit "above" planets

import * as THREE from "/assets/js/modules/r150/three.module.js";
import { GUI } from "/assets/js/modules/0.7.9/dat.gui.module.js";
import Stats from "/assets/js/modules/r150/stats.module.js";

function deg2rad(d) {
    return Math.PI * d / 180.0;
}

class Controls {
    constructor() {
        this.animate = true;
        this.show_mars = true;
        this.show_venus = false;
        this.speed = 4;
        this.zoom = 3.0;
    }
}

class Planet {
    constructor(radius, distance, textureFile, show_day) {
        this.radius = radius;
        this.distance = distance;
        this.show_day = show_day;
        this.angle_deg = 0;
        this.x = this.distance * Math.cos(deg2rad(this.angle_deg));
        this.y = this.distance * Math.sin(deg2rad(this.angle_deg));
        this.textureFile = textureFile;
        this.system = new THREE.Group();

        const geometry = new THREE.SphereGeometry(this.radius);
        const texture = new THREE.TextureLoader().load(this.textureFile);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = Math.PI / 2;  // pole towards eye
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

        if (show_day) {
            const geometry = new THREE.CircleGeometry(20, 32, Math.PI / 2, Math.PI);
            const material = new THREE.MeshBasicMaterial({ color: 0xaaaadd, transparent: true, opacity: 0.25 });
            const day_mesh = new THREE.Mesh(geometry, material);
            day_mesh.position.x += this.distance;
            this.system.add(day_mesh);
        }
    }

    rotateAroundSun(delta_deg) {
        this.angle_deg += delta_deg;
        if (this.angle_deg > 360) {
            this.angle_deg -= 360;
        }
        else if (this.angle_deg < 0) {
            this.angle_deg += 360;
        }
        // this also rotates the day_mesh
        this.system.rotation.z = deg2rad(this.angle_deg);
        this.x = this.distance * Math.cos(deg2rad(this.angle_deg));
        this.y = this.distance * Math.sin(deg2rad(this.angle_deg));
    }

    rotateOnAxis(delta_deg) {
        this.mesh.rotation.y += deg2rad(delta_deg);
    }
}

class PlanetLine {
    constructor(p0, p1, color) {
        this.p0 = p0;
        this.p1 = p1;
        this.angle_deg = 0;
        this.system = new THREE.Group();

        const material = new THREE.LineBasicMaterial({ color: color });
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
        const x = this.p0.x + dx * 1000;
        const y = this.p0.y + dy * 1000;

        positions[3] = x;
        positions[4] = y;

        this.angle_deg = (180 / Math.PI) * Math.atan2(dy, dx);
        if (this.angle_deg < 0) {
            this.angle_deg = 360 + this.angle_deg;
        }

    }

    // return normalized slope
    getSlope() {
        const dx = this.p1.x - this.p0.x;
        const dy = this.p1.y - this.p0.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        return {
            x: dx / len,
            y: dy / len
        }
    }

}

class Firmament {
    constructor() {
        this.system = new THREE.Group();
        const N = 19;
        for (var i = 0; i < N; i++) {
            const distance = 6;
            const dist_max = 6;
            const rand_dist = dist_max * Math.random() - dist_max / 2;
            const angle = 2 * Math.PI * (i / N);
            const rand_angle = 10 * (2 * Math.PI / 360) * Math.random();
            const x = (distance + rand_dist) * Math.cos(angle + rand_angle);
            const y = (distance + rand_dist) * Math.sin(angle + rand_angle);
            this.textureFile = "/assets/image/star.png";

            const geometry = new THREE.PlaneGeometry(1, 1)
            const texture = new THREE.TextureLoader().load(this.textureFile);
            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.position.x += x;
            this.mesh.position.y += y;
            this.system.add(this.mesh);
        }
    }
}

var dim = 548;
var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
var renderer = new THREE.WebGLRenderer({
    antialias: true,
    depth: true,
    depthBuffer: true,
});
//var stats = Stats();
const gui = new GUI();
var controls = new Controls();
const sun = new Planet(0.1, 0.0, "/assets/image/sun.jpeg", false);
const venus = new Planet(0.05, 0.5 * 0.7, "/assets/image/venus.jpeg", false);
const earth = new Planet(0.05, 0.5, "/assets/image/earth.jpeg", true);
const mars = new Planet(0.04, 0.5 * 1.524, "/assets/image/mars.jpeg", false);
const sun_earth = new PlanetLine(sun, earth, 0xdddd44);
const earth_mars = new PlanetLine(earth, mars, 0xdd4444);
const earth_venus = new PlanetLine(earth, venus, 0x44dddd);
const firmament = new Firmament();

gui.add(controls, "animate").name("Animate");
gui.add(controls, "show_mars").name("Mars");
gui.add(controls, "show_venus").name("Venus");
gui.add(controls, "zoom", 1.0, 11.0, 0.01).name("Zoom");
gui.add(controls, "speed", -10.0, 10.0, 0.1).name("Speed");
gui.add(earth, "angle_deg", 0.0, 360, 1).name("Earth ∠°").listen();
gui.add(mars, "angle_deg", 0.0, 360, 1).name("Mars ∠°").listen();
gui.add(venus, "angle_deg", 0.0, 360, 1).name("Venus ∠°").listen();
//gui.add(earth_mars, "angle_deg", -360, 360, 0.1).name("marsFromEarth").listen();

function initCanvas() {
    renderer.setSize(dim, dim);
    renderer.setClearColor(0x222222);
    var div = document.getElementById("view");
    div.appendChild(gui.domElement)
    //div.appendChild(stats.domElement); // FIXME -- mke relative to div, not top page
    div.appendChild(renderer.domElement);

    const solarSystem = new THREE.Group();

    solarSystem.add(sun.system);
    solarSystem.add(earth.system);
    solarSystem.add(mars.system);
    solarSystem.add(venus.system);
    solarSystem.add(sun_earth.system);
    solarSystem.add(earth_mars.system);
    solarSystem.add(earth_venus.system);
    solarSystem.add(firmament.system);

    scene.add(solarSystem);
}

function render() {
    mars.system.visible = controls.show_mars;
    earth_mars.system.visible = controls.show_mars;
    venus.system.visible = controls.show_venus;
    earth_venus.system.visible = controls.show_venus;
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate);

    var speed = controls.animate ? controls.speed : 0.0;

    camera.zoom = 1 / controls.zoom;
    camera.updateProjectionMatrix();

    const EARTH_YEAR_DELTA = 360 * (1 / 60) * (1 / 60) * speed;
    const EARTH_DAY_DELTA = EARTH_YEAR_DELTA * 10;
    const MARS_YEAR_DELTA = (365 / 687) * EARTH_YEAR_DELTA;
    const MARS_DAY_DELTA = MARS_YEAR_DELTA * 10;
    const VENUS_YEAR_DELTA = (365 / 224.7) * EARTH_YEAR_DELTA;
    const VENUS_DAY_DELTA = VENUS_YEAR_DELTA * 1;
    earth.rotateAroundSun(EARTH_YEAR_DELTA);
    earth.rotateOnAxis(EARTH_DAY_DELTA);
    mars.rotateAroundSun(MARS_YEAR_DELTA);
    mars.rotateOnAxis(MARS_DAY_DELTA);
    venus.rotateAroundSun(VENUS_YEAR_DELTA);
    venus.rotateOnAxis(VENUS_DAY_DELTA);
    sun_earth.update();
    earth_mars.update();
    earth_venus.update();

    render()
    //stats.update();
}

initCanvas();
animate();
