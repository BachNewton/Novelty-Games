import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons';

export function addLight(scene: THREE.Scene) {
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
}

export function addSkybox(scene: THREE.Scene) {
    scene.background = new THREE.Color('lightblue');
}

export function addGround(scene: THREE.Scene) {
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),
        new THREE.MeshPhongMaterial({ color: 0x999999 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(50, 50);
    scene.add(grid);
}

export function createOrbitControls(camera: THREE.PerspectiveCamera, rendererDomElement: HTMLCanvasElement): OrbitControls {
    const controls = new OrbitControls(camera, rendererDomElement);
    controls.object.position.set(0, 8, 12);
    controls.target.set(0, 2, 0);
    controls.update();
    return controls;
}
