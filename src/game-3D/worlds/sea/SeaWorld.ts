import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { Water } from 'three/examples/jsm/objects/Water';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import WaterNormalsTexture from './textures/waternormals.jpg';

const SAILBOAT_MODEL_URL = 'https://raw.githubusercontent.com/BachNewton/Novelty-Games/refs/heads/main/models/sailboat/scene.gltf';

export default class SeaWorld {
    scene: THREE.Scene;
    pmremGenerator: THREE.PMREMGenerator;
    sceneEnv = new THREE.Scene();
    renderTarget: THREE.WebGLRenderTarget;

    testingCubes: THREE.Object3D[];
    sailboat: THREE.Group | null;
    sun: THREE.Vector3;
    sky: Sky;
    skyParameters = {
        elevation: 2,
        azimuth: 180
    };
    date = {
        hour: 8,
        day: 150
    };
    water: Water;

    constructor(scene: THREE.Scene, pmremGenerator: THREE.PMREMGenerator) {
        this.scene = scene;
        this.pmremGenerator = pmremGenerator;
        this.renderTarget = pmremGenerator.fromScene(this.sceneEnv);

        this.sun = new THREE.Vector3();
        this.sky = this.createSky();
        this.water = this.createWater();
        this.scene.add(this.sky, this.water);

        this.testingCubes = this.createTestingCubes();
        this.scene.add(...this.testingCubes);

        this.sailboat = null;
        new GLTFLoader().loadAsync(SAILBOAT_MODEL_URL).then(gltf => {
            this.sailboat = gltf.scene;

            this.sailboat.scale.multiplyScalar(0.01);

            this.scene.add(this.sailboat);
        }).catch(error => {
            console.error(error);
        });

        const gui = new GUI();
        gui.add(this.date, 'day', 1, 365, 1).onChange(() => this.calculateSunPosition());
        gui.add(this.date, 'hour', 0, 23.5, 0.5).onChange(() => this.calculateSunPosition());
    }

    update(deltaTime: number) {
        this.updateSun();

        this.water.material.uniforms['time'].value += deltaTime * 0.0002;

        this.testingCubes.forEach(testingCube => {
            testingCube.rotateX(deltaTime * 0.001);
            testingCube.rotateY(deltaTime * 0.001);
        });
    }

    private createTestingCubes(): THREE.Object3D[] {
        return [0xff0000, 0x00ff00, 0x0000ff].map((color, index) => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ color: color });
            const cube = new THREE.Mesh(geometry, material);

            cube.translateY(1);

            if (index === 0) {
                cube.translateX(10);
            } else if (index === 1) {
                cube.translateX(-10);
            } else {
                cube.translateZ(-10);
            }

            return cube;
        });
    }

    private createWater(): Water {
        const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

        const water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load(WaterNormalsTexture, texture => {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                }),
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                fog: false
            }
        );

        water.rotateX(-Math.PI / 2);

        return water;
    }

    private createSky(): Sky {
        const sky = new Sky();

        sky.scale.setScalar(10000);

        const skyUniforms = sky.material.uniforms;
        skyUniforms['turbidity'].value = 10;
        skyUniforms['rayleigh'].value = 2;
        skyUniforms['mieCoefficient'].value = 0.005;
        skyUniforms['mieDirectionalG'].value = 0.8;

        return sky;
    }

    private updateSun() {
        const phi = THREE.MathUtils.degToRad(90 - this.skyParameters.elevation);
        const theta = THREE.MathUtils.degToRad(this.skyParameters.azimuth);

        this.sun.setFromSphericalCoords(1, phi, theta);

        this.sky.material.uniforms['sunPosition'].value.copy(this.sun);
        this.water.material.uniforms['sunDirection'].value.copy(this.sun).normalize();

        this.renderTarget.dispose();

        this.sceneEnv.add(this.sky);
        this.renderTarget = this.pmremGenerator.fromScene(this.sceneEnv);
        this.scene.add(this.sky);

        this.scene.environment = this.renderTarget.texture;
    }

    private temp() {
        // Hour Angle (H) = (Time - 12) * 15
        // Declination (D) = 23.45 * sin(360 * (day - 80) / 365)
        // Elevation (E) = arcsin(sin(latitude) * sin(D) + cos(latitude) * cos(D) * cos(H))
        // Azimuth (A) = arctan(sin(H) / (cos(H) * sin(latitude) - tan(D) * cos(latitude)))

        const time = this.date.hour; // 6 pm
        const day = this.date.day; // May 28th
        const latitude = 60.17; // Helsinki

        const hourAngle = (time - 12) * 15;
        const declination = 23.45 * Math.sin(360 * (day - 80) / 365);
        const elevation = Math.asin(Math.sin(latitude) * Math.sin(declination) + Math.cos(latitude) * Math.cos(declination) * Math.cos(hourAngle));
        const azimuth = Math.atan2(Math.sin(hourAngle), Math.cos(hourAngle) * Math.sin(latitude) - Math.tan(declination) * Math.cos(latitude));

        this.skyParameters.elevation = elevation * 180 / Math.PI;
        this.skyParameters.azimuth = azimuth * 180 / Math.PI;
    }

    private calculateSunPosition() {
        const dayOfYear = this.date.day;
        const hourOfDay = this.date.hour;
        const latitude = 60.17; // Helsinki

        // Convert day of year to radians
        const n = dayOfYear - 80;
        const theta = (n * Math.PI) / 182.5;

        // Calculate the equation of time
        const E = 229.18 * (0.000075 + 0.001868 * Math.cos(theta) - 0.032047 * Math.sin(theta) - 0.014754 * Math.cos(2 * theta) - 0.000578 * Math.sin(2 * theta));

        // Calculate the true solar time
        const trueSolarTime = hourOfDay + E / 4;

        // Convert true solar time to radians
        const h = (trueSolarTime * Math.PI) / 12;

        // Calculate the declination
        const delta = 0.409 * Math.sin(theta);

        // Calculate the hour angle
        const H = (hourOfDay - 0) * Math.PI / 12;

        // Calculate the elevation
        const elevation = Math.asin(Math.sin(latitude) * Math.sin(delta) + Math.cos(latitude) * Math.cos(delta) * Math.cos(H)) * 180 / Math.PI;

        // Calculate the azimuth
        let azimuth = Math.atan2(-Math.sin(H), Math.cos(H) * Math.sin(latitude) - Math.tan(delta) * Math.cos(latitude)) * 180 / Math.PI;

        // Adjust azimuth to be in the range 0-360 degrees
        if (azimuth < 0) {
            azimuth += 360;
        } else if (azimuth > 180) {
            azimuth += 180;
        }

        this.skyParameters.elevation = elevation;
        this.skyParameters.azimuth = azimuth;
    }
}