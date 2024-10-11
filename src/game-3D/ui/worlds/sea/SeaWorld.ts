import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const SAILBOAT_MODEL_URL = 'https://raw.githubusercontent.com/BachNewton/Novelty-Games/refs/heads/main/models/sailboat/scene.gltf';

export default class SeaWorld {
    testingCube: THREE.Object3D;
    sailboat: THREE.Group | null;

    constructor(addToScene: (object: THREE.Object3D) => void) {
        this.testingCube = this.createTestingCube();
        addToScene(this.testingCube);

        this.sailboat = null;
        const loader = new GLTFLoader();
        loader.loadAsync(SAILBOAT_MODEL_URL).then(gltf => {
            this.sailboat = gltf.scene;

            this.sailboat.scale.multiplyScalar(0.01);
            this.sailboat.rotateY(2 * Math.PI / 3);

            addToScene(this.sailboat);
        }).catch(error => {
            console.error(error);
        });
    }

    update() {
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
}
