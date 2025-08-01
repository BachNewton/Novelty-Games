import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GameWorld, GameWorldCreator } from "../GameWorld";
import { FBXLoader, OrbitControls } from 'three/examples/jsm/Addons';
import KnightRunAnimationFbx from './models/Lite Sword and Shield Pack/sword and shield run.fbx';
import { updateRoute, Route } from '../../../ui/Routing';

const KNIGHT_MODEL_URL = 'https://raw.githubusercontent.com/BachNewton/Novelty-Games/refs/heads/main/models/knight/Paladin%20WProp%20J%20Nordstrom.fbx';

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
    updateRoute(Route.KNIGHT_GAME);

    addLight(scene);
    addSkybox(scene);
    addGround(scene);
    createOrbitControls(camera, domElement);

    let mixer: THREE.AnimationMixer | null = null;
    let bone: THREE.Bone | null = null;
    let knight: THREE.Group | null = null;

    const loader = new FBXLoader();
    loader.load(KNIGHT_MODEL_URL, data => {
        knight = data;
        console.log(data);

        data.scale.multiplyScalar(0.01);

        bone = data.children[0] as THREE.Bone;

        const helmentMesh = data.children[1] as THREE.SkinnedMesh;
        helmentMesh.frustumCulled = false;

        const knightMesh = data.children[2] as THREE.SkinnedMesh;
        knightMesh.frustumCulled = false;

        const sheildMesh = data.children[3] as THREE.SkinnedMesh;
        sheildMesh.frustumCulled = false;

        const swordMesh = data.children[4] as THREE.SkinnedMesh;
        swordMesh.frustumCulled = false;

        mixer = new THREE.AnimationMixer(data);

        loader.load(KnightRunAnimationFbx, data => {
            const clip = data.animations[0];
            const action = mixer?.clipAction(clip);
            action?.play();
        });

        scene.add(data);
        scene.add(new THREE.SkeletonHelper(data));
    });

    const testBox1 = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshStandardMaterial({ color: 'red' })
    );
    testBox1.position.set(-1.5, 0.5, 0);

    const testBox2 = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshStandardMaterial({ color: 'green' })
    );
    testBox2.position.set(1.5, 0.5, 0);

    scene.add(testBox1, testBox2);

    return {
        update: (deltaTime) => {
            mixer?.update(deltaTime / 1000);

            if (bone && knight) {
                knight.position.z = -bone.position.z * 0.01;
            }
        }
    };
}

function addGround(scene: THREE.Scene) {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshPhongMaterial({ color: 0x999999 }));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const grid = new THREE.GridHelper(50, 50);
    scene.add(grid);
}

function addLight(scene: THREE.Scene) {
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 5);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 5);
    directionalLight.position.set(1, 1, 1);

    scene.add(ambientLight);
    scene.add(directionalLight);
}

function createOrbitControls(camera: THREE.PerspectiveCamera, rendererDomElement: HTMLCanvasElement): OrbitControls {
    const controls = new OrbitControls(camera, rendererDomElement);

    controls.object.position.set(0, 1.5, 3);
    controls.update();

    return controls;
}


function addSkybox(scene: THREE.Scene) {
    scene.background = new THREE.Color('skyblue');
}
