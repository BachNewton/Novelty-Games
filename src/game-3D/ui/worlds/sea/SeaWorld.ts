import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { Water } from 'three/examples/jsm/objects/Water';

const SAILBOAT_MODEL_URL = 'https://raw.githubusercontent.com/BachNewton/Novelty-Games/refs/heads/main/models/sailboat/scene.gltf';

export default class SeaWorld {
    scene: THREE.Scene;
    pmremGenerator: THREE.PMREMGenerator;
    sceneEnv = new THREE.Scene();
    renderTarget: THREE.WebGLRenderTarget;

    testingCube: THREE.Object3D;
    sailboat: THREE.Group | null;
    sun: THREE.Vector3;
    sky: Sky;
    skyParameters = {
        elevation: 2,
        azimuth: 180
    };
    water: Water;

    constructor(scene: THREE.Scene, pmremGenerator: THREE.PMREMGenerator) {
        this.scene = scene;
        this.pmremGenerator = pmremGenerator;
        this.renderTarget = pmremGenerator.fromScene(this.sceneEnv);

        this.sun = new THREE.Vector3();
        this.sky = this.createSky();
        this.water = this.createWater();

        this.testingCube = this.createTestingCube();
        this.scene.add(this.testingCube);

        this.sailboat = null;
        new GLTFLoader().loadAsync(SAILBOAT_MODEL_URL).then(gltf => {
            this.sailboat = gltf.scene;

            this.sailboat.scale.multiplyScalar(0.01);
            this.sailboat.rotateY(2 * Math.PI / 3);

            this.scene.add(this.sailboat);
        }).catch(error => {
            console.error(error);
        });
    }

    update() {
        const time = performance.now() * 0.001;

        this.updateSun();

        this.water.material.uniforms['time'].value += 1 / 60;

        this.testingCube.rotateX(0.01);
        this.testingCube.rotateY(0.01);

        this.sailboat?.rotateY(0.0005);
    }

    private createTestingCube(): THREE.Object3D {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);

        cube.translateX(10);

        return cube;
    }

    private createWater(): Water {
        const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

        const water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', texture => {
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
}