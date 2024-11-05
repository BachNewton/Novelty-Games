import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons'

const SAILBOAT_MODEL_URL = 'https://raw.githubusercontent.com/BachNewton/Novelty-Games/refs/heads/main/models/sailboat/scene.gltf';

export function createSailboat(): THREE.Object3D {
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
