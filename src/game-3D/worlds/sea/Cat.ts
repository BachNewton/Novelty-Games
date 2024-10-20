import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

const CAT_MODEL_URL = 'https://raw.githubusercontent.com/BachNewton/Novelty-Games/refs/heads/game-3D/models/cat/Models/cat.fbx';

export default class Cat {
    private object: THREE.Object3D;

    animationMixer: THREE.AnimationMixer;
    animationActions: THREE.AnimationAction[] = [];

    constructor(scene: THREE.Scene) {
        this.object = new THREE.Object3D();
        this.animationMixer = new THREE.AnimationMixer(this.object);

        new FBXLoader().loadAsync(CAT_MODEL_URL).then(ftx => {
            const mesh = ftx.children[0] as THREE.SkinnedMesh;
            const oldMaterial = mesh.material as THREE.MeshPhongMaterial;
            const newMaterial = new THREE.MeshStandardMaterial({
                map: oldMaterial.map,
                color: oldMaterial.color
            });
            mesh.material = newMaterial;

            const helper = new THREE.SkeletonHelper(ftx);
            scene.add(helper);

            this.animationMixer = new THREE.AnimationMixer(ftx);
            this.animationActions = ftx.animations.map(animation => this.animationMixer.clipAction(animation));

            ftx.scale.multiplyScalar(0.02);

            this.object.add(ftx);
        }).catch(error => {
            console.error(error);
        });

        this.object.translateY(2.5);

        scene.add(this.object);
    }

    update(deltaTime: number) {
        this.animationMixer.update(deltaTime / 1000);
    }
}
