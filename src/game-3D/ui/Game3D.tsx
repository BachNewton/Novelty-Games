import { useEffect, useRef } from "react";
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GameWorld } from "../worlds/GameWorld";
import MarbleWorld from "../worlds/marble/MarbleWorld";
import { KeyboardInputCreator } from "../input/Keyboard";

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

    const world = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.80665, 0)
    });

    onWindowResize(camera, renderer);
    window.addEventListener('resize', () => onWindowResize(camera, renderer));

    const gameWorld: GameWorld = MarbleWorld.create(
        scene,
        camera,
        world,
        KeyboardInputCreator.create()
    );

    setControls(camera, renderer.domElement);

    let previousTime = performance.now();

    const animate = (timeNow: DOMHighResTimeStamp) => {
        const deltaTime = timeNow - previousTime;
        previousTime = timeNow;

        world.step(deltaTime / 1000);
        gameWorld.update(deltaTime);
        renderer.render(scene, camera);
        stats.update();
    };

    renderer.setAnimationLoop(animate);
}

function createCamera(): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    camera.position.z = 10;
    camera.position.y = 8;
    camera.position.x = 8;

    return camera;
}

function createRenderer(containerElement: HTMLDivElement): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    renderer.shadowMap.enabled = true;

    containerElement.appendChild(renderer.domElement);

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
