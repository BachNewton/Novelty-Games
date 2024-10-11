import { useEffect, useRef } from "react";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Sky } from 'three/examples/jsm/objects/Sky';
import Stats from 'three/examples/jsm/libs/stats.module';
import SeaWorld from "./worlds/sea/SeaWorld";

let hasGameBeenSetup = false;

const Game3D: React.FC = () => {
    const containerElement = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (hasGameBeenSetup) return;
        hasGameBeenSetup = true;

        const scene = new THREE.Scene();
        const camera = createCamera();
        const renderer = createRenderer(containerElement?.current!);
        const stats = createStats(containerElement?.current!);

        onWindowResize(camera, renderer);
        window.addEventListener('resize', () => onWindowResize(camera, renderer));

        const seaWorld = new SeaWorld(object => scene.add(object));

        addLights(objects => scene.add(objects));
        setControls(camera, renderer.domElement);
        extraStuff(object => scene.add(object));

        const animate = () => {
            seaWorld.update();
            renderer.render(scene, camera);
            stats.update();
        };

        renderer.setAnimationLoop(animate);
    }, []);

    return <div style={{ overflow: 'hidden', height: '100vh' }} ref={containerElement}></div>;
};

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

function extraStuff(addToScene: (object: THREE.Object3D) => void) {
    const sun = new THREE.Vector3();

    const sky = new Sky();
    sky.scale.setScalar(10000);
    addToScene(sky);

    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;

    const parameters = {
        elevation: 2,
        azimuth: 180
    };

    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
}

export default Game3D;
