import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import WaterNormalsTexture from './textures/waternormals.jpg';
import SunCalc from 'suncalc';
import { AmmoPhysics, Water, Sky } from 'three/examples/jsm/Addons';

const CITIES = {
    helsinki: {
        latitude: 60.17,
        longitude: 24.93545
    }
};

export default class SeaWorld {
    scene: THREE.Scene;
    pmremGenerator: THREE.PMREMGenerator;
    sceneEnv = new THREE.Scene();
    renderTarget: THREE.WebGLRenderTarget;

    testingCubes: THREE.Object3D[];
    sun: THREE.Vector3;
    sky: Sky;
    skyParameters = {
        elevation: 2,
        azimuth: 180
    };
    date = new Date();
    dateProps = {
        Month: this.date.getMonth(),
        Date: this.date.getDate(),
        Hour: this.date.getHours(),
        'Time Scale': 500
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

        this.addGUI();

        this.calculateSunPosition();

        AmmoPhysics().then(ammoPhysicsObject => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ color: 'magenta' });
            const cube = new THREE.Mesh(geometry, material);

            cube.translateY(15);

            this.scene.add(cube);
            ammoPhysicsObject.addMesh(cube, 1);

            setInterval(() => {
                const geometry = new THREE.SphereGeometry(0.5);
                const material = new THREE.MeshStandardMaterial({ color: 'yellow' });
                const sphere = new THREE.Mesh(geometry, material);

                sphere.translateY(15);

                this.scene.add(sphere);
                ammoPhysicsObject.addMesh(sphere, 1);
            }, 750);

            const geometry2 = new THREE.BoxGeometry(15, 1, 15);
            const material2 = new THREE.MeshStandardMaterial({ color: 'white' });
            const floor = new THREE.Mesh(geometry2, material2);

            this.scene.add(floor);
            ammoPhysicsObject.addMesh(floor, 0);
        });
    }

    update(deltaTime: number) {
        this.updateSun();

        this.water.material.uniforms['time'].value += deltaTime * 0.0002;

        for (const testingCube of this.testingCubes) {
            testingCube.rotateX(deltaTime * 0.001);
            testingCube.rotateY(deltaTime * 0.001);
        }

        this.date.setTime(this.date.getTime() + deltaTime * this.dateProps['Time Scale']);
        this.updateSkyParameters();
    }

    private addGUI() {
        const gui = new GUI();

        const dateAndTimeFolder = gui.addFolder('Date & Time');
        dateAndTimeFolder.add(this.dateProps, 'Month', 1, 12, 1).onChange(() => this.calculateSunPosition());
        dateAndTimeFolder.add(this.dateProps, 'Date', 1, 31, 1).onChange(() => this.calculateSunPosition());
        dateAndTimeFolder.add(this.dateProps, 'Hour', 0, 23, 1).onChange(() => this.calculateSunPosition());
        dateAndTimeFolder.add(this.dateProps, 'Time Scale', 1, 3000, 5);
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
        this.date.setMonth(this.dateProps.Month - 1);
        this.date.setDate(this.dateProps.Date);
        this.date.setHours(this.dateProps.Hour);

        this.updateSkyParameters();
    }

    private updateSkyParameters() {
        const latitude = CITIES.helsinki.latitude;
        const longitude = CITIES.helsinki.longitude;

        const position = SunCalc.getPosition(this.date, latitude, longitude);

        this.skyParameters.azimuth = THREE.MathUtils.radToDeg(position.azimuth);
        this.skyParameters.elevation = THREE.MathUtils.radToDeg(position.altitude);
    }
}
