import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GameWorld, GameWorldCreator } from "../GameWorld";
import { FBXLoader, OrbitControls } from 'three/examples/jsm/Addons';
import KnightModelFbx from './models/Lite Sword and Shield Pack/Paladin WProp J Nordstrom.fbx'

export const KnightWorld: GameWorldCreator = {
    create: (scene, camera, world, domElement, updateHUD, updateSummary) => createKnightWorld(scene, camera, world, domElement, updateHUD, updateSummary)
};

function createKnightWorld(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    world: CANNON.World,
    domElement: HTMLCanvasElement,
    updateHUD: (text: string) => void,
    updateSummary: (element: JSX.Element) => void
): GameWorld {
    addLight(scene);

    createOrbitControls(camera, domElement);

    camera.position.z = 3;
    camera.position.y = 1;

    const loader = new FBXLoader();
    loader.load(KnightModelFbx, data => {
        data.scale.multiplyScalar(0.01);

        const helmentMesh = data.children[1] as THREE.SkinnedMesh;
        const knightMesh = data.children[2] as THREE.SkinnedMesh;

        scene.add(data);
    });

    const testBox1 = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshStandardMaterial({ color: 'red' })
    );
    testBox1.position.x = -1;

    const testBox2 = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshStandardMaterial({ color: 'green' })
    );
    testBox2.position.x = 1;

    scene.add(testBox1, testBox2);

    return {
        update: (deltaTime) => {
            //
        }
    };
}

function addLight(scene: THREE.Scene) {
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 3);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 5);
    directionalLight.position.set(1, 1, 1);

    scene.add(ambientLight);
    scene.add(directionalLight);
}

function createOrbitControls(camera: THREE.PerspectiveCamera, rendererDomElement: HTMLCanvasElement): OrbitControls {
    const controls = new OrbitControls(camera, rendererDomElement);

    return controls;
}
