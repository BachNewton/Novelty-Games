import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { Water } from 'three/examples/jsm/objects/Water';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import WaterNormalsTexture from './textures/waternormals.jpg';
import SunCalc from 'suncalc';
import Cat from './Cat';

const SAILBOAT_MODEL_URL = 'https://raw.githubusercontent.com/BachNewton/Novelty-Games/refs/heads/main/models/sailboat/scene.gltf';

export default class SeaWorld {
    scene: THREE.Scene;
    pmremGenerator: THREE.PMREMGenerator;
    sceneEnv = new THREE.Scene();
    renderTarget: THREE.WebGLRenderTarget;

    testingCubes: THREE.Object3D[];
    sailboat: THREE.Object3D;
    cat: Cat;
    sun: THREE.Vector3;
    sky: Sky;
    skyParameters = {
        elevation: 2,
        azimuth: 180
    };
    date = new Date();
    dateProps = {
        month: this.date.getMonth(),
        date: this.date.getDate(),
        hour: this.date.getHours(),
        timeScale: 500
    };
    water: Water;
    catAnimation = {
        catAnimation: 0
    };

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

        this.sailboat = this.createSailboat();
        this.scene.add(this.sailboat);

        this.cat = new Cat(this.scene);

        const gui = new GUI();
        gui.add(this.dateProps, 'month', 1, 12, 1).onChange(() => this.calculateSunPosition());
        gui.add(this.dateProps, 'date', 1, 31, 1).onChange(() => this.calculateSunPosition());
        gui.add(this.dateProps, 'hour', 0, 24, 1).onChange(() => this.calculateSunPosition());
        gui.add(this.dateProps, 'timeScale', 1, 3000, 5);
        gui.add(this.catAnimation, 'catAnimation', 0, 7, 1).onChange(() => {
            this.cat.animationMixer.stopAllAction();
            this.cat.animationActions[this.catAnimation.catAnimation].play();
        });
        this.calculateSunPosition();
    }

    update(deltaTime: number) {
        this.updateSun();

        this.water.material.uniforms['time'].value += deltaTime * 0.0002;

        this.testingCubes.forEach(testingCube => {
            testingCube.rotateX(deltaTime * 0.001);
            testingCube.rotateY(deltaTime * 0.001);
        });

        this.date.setTime(this.date.getTime() + deltaTime * this.dateProps.timeScale);
        this.updateSkyParameters();

        this.cat.update(deltaTime);
    }

    private createSailboat(): THREE.Object3D {
        const sailboat = new THREE.Object3D();

        new GLTFLoader().loadAsync(SAILBOAT_MODEL_URL).then(gltf => {
            const loadedSailboat = gltf.scene.children[0];

            loadedSailboat.scale.multiplyScalar(0.01);

            sailboat.add(loadedSailboat);
        }).catch(error => {
            console.error(error);
        });

        return sailboat;
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

    private calculateSunPosition() {
        this.date.setMonth(this.dateProps.month - 1);
        this.date.setDate(this.dateProps.date);
        this.date.setHours(this.dateProps.hour);

        this.updateSkyParameters();
    }

    private updateSkyParameters() {
        const latitude = 60.17; // Helsinki
        const longitude = 24.93545; // Helsinki

        const position = SunCalc.getPosition(this.date, latitude, longitude);

        this.skyParameters.azimuth = THREE.MathUtils.radToDeg(position.azimuth);
        this.skyParameters.elevation = THREE.MathUtils.radToDeg(position.altitude);
    }
}