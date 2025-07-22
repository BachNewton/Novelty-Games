import { useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GameWorld, GameWorldCreator } from "../worlds/GameWorld";
import MarbleWorld from "../worlds/marble/logic/MarbleWorld";
import { KnightWorld } from "../worlds/knight/KnightWorld";
import { Game } from "./Home";

const MINIUM_FRAME_RATE = 1000 / 25;

let hasGameBeenSetup = false;

interface Game3DProps {
    game: Game;
}

const Game3D: React.FC<Game3DProps> = ({ game }) => {
    const containerElement = useRef<HTMLDivElement>(null);
    const [HUDText, setHUDText] = useState('');
    const [summary, setSummary] = useState(<></>);

    useEffect(() => {
        if (hasGameBeenSetup) return;
        hasGameBeenSetup = true;

        setupGame(game, containerElement?.current!, setHUDText, setSummary);
    }, []);

    return <div style={{ overflow: 'hidden', height: '100dvh' }} ref={containerElement}>
        <div style={{
            position: 'absolute',
            width: '100%',
            color: 'white',
            'fontSize': '2em',
            marginTop: '25px',
            textAlign: 'center',
            userSelect: 'none',
            pointerEvents: 'none'
        }}>
            {HUDText}
        </div>

        <div style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            color: 'white',
            userSelect: 'none',
            pointerEvents: 'none'
        }}>
            {summary}
        </div>
    </div>;
};

function setupGame(game: Game, containerElement: HTMLDivElement, updateHUD: (text: string) => void, updateSummary: (element: JSX.Element) => void) {
    const scene = new THREE.Scene();
    const camera = createCamera();
    const renderer = createRenderer(containerElement);
    const stats = createStats(containerElement);

    const world = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.80665, 0)
    });

    onWindowResize(camera, renderer);
    window.addEventListener('resize', () => onWindowResize(camera, renderer));

    const gameWorld: GameWorld = getGameWorldCreator(game).create(scene, camera, world, renderer.domElement, updateHUD, updateSummary);

    let previousTime = performance.now();

    const animate = (timeNow: DOMHighResTimeStamp) => {
        const deltaTime = Math.min(timeNow - previousTime, MINIUM_FRAME_RATE);
        previousTime = timeNow;

        world.step(deltaTime / 1000);
        gameWorld.update(deltaTime);
        renderer.render(scene, camera);
        stats.update();
    };

    renderer.setAnimationLoop(animate);
}

function getGameWorldCreator(game: Game): GameWorldCreator {
    switch (game) {
        case Game.MARBLE:
            return MarbleWorld;
        case Game.KNIGHT:
            return KnightWorld;
    }
}

function createCamera(): THREE.PerspectiveCamera {
    return new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
}

function createRenderer(containerElement: HTMLDivElement): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    containerElement.appendChild(renderer.domElement);

    return renderer;
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
