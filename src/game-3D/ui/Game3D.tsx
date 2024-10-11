import { useEffect, useRef } from "react";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import SeaWorld from "../worlds/sea/SeaWorld";

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

    setControls(camera, renderer.domElement);

    let previousTime = performance.now();

    const animate = (timeNow: DOMHighResTimeStamp) => {
        const deltaTime = timeNow - previousTime;
        previousTime = timeNow;

        seaWorld.update(deltaTime);
        renderer.render(scene, camera);
        stats.update();
    };

    renderer.setAnimationLoop(animate);
}

function createCamera(): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    camera.position.z = 25;
    camera.position.y = 15;
    camera.position.x = 10;

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

function onWindowResize(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

export default Game3D;
