import { useEffect, useRef } from "react";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { Water } from 'three/examples/jsm/objects/Water';
import Stats from 'three/examples/jsm/libs/stats.module';
import SeaWorld from "./worlds/sea/SeaWorld";

let hasGameBeenSetup = false;

const Game3D: React.FC = () => {
    const containerElement = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (hasGameBeenSetup) return;
        hasGameBeenSetup = true;

        setupGame(containerElement?.current!);
    }, []);

    return <div style={{ overflow: 'hidden', height: '100vh' }} ref={containerElement}></div>;
};

function setupGame(containerElement: HTMLDivElement) {
    const scene = new THREE.Scene();
    const camera = createCamera();
    const renderer = createRenderer(containerElement);
    const stats = createStats(containerElement);

    onWindowResize(camera, renderer);
    window.addEventListener('resize', () => onWindowResize(camera, renderer));

    const seaWorld = new SeaWorld(scene, new THREE.PMREMGenerator(renderer));

    // addLights(objects => scene.add(objects));
    setControls(camera, renderer.domElement);

    const animate = () => {
        seaWorld.update();
        renderer.render(scene, camera);
        stats.update();
    };

    renderer.setAnimationLoop(animate);
}

function createCamera(): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    camera.position.z = 25;
    camera.position.y = 10;

    return camera;
}

function createRenderer(containerElement: HTMLDivElement): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;

    containerElement?.appendChild(renderer.domElement);

    return renderer;
}

function setControls(camera: THREE.PerspectiveCamera, rendererDomElement: HTMLCanvasElement) {
    const controls = new OrbitControls(camera, rendererDomElement);

    controls.update();
}

function createStats(containerElement: HTMLDivElement): Stats {
    const stats = new Stats();

    containerElement.appendChild(stats.dom);

    return stats;
}

function addLights(addToScene: (...objects: THREE.Object3D[]) => void) {
    const ambientLight = new THREE.AmbientLight();

    const directionalLight = new THREE.DirectionalLight(0xffd700);
    directionalLight.position.set(1, 1, -1);

    addToScene(ambientLight, directionalLight);
}

function onWindowResize(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

export default Game3D;
