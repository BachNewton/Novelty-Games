import { useEffect, useRef } from "react";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let hasGameBeenSet = false;

const Game3D: React.FC = () => {
    const containerElement = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (hasGameBeenSet) return;
        hasGameBeenSet = true;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        const renderer = new THREE.WebGLRenderer();

        const resize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.render(scene, camera);
        }
        resize();

        window.addEventListener('resize', resize);

        let sailboat: THREE.Group | null = null;

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.translateX(10);
        scene.add(cube);

        const ambientLight = new THREE.AmbientLight();
        const directionalLight = new THREE.DirectionalLight(0xffd700);
        directionalLight.position.set(1, 1, -1);
        scene.add(ambientLight, directionalLight);

        camera.position.z = 25;
        camera.position.y = 10;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.update();

        const animate = () => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;

            sailboat?.rotateY(0.001);

            renderer.render(scene, camera);
        };

        renderer.setAnimationLoop(animate);
        containerElement?.current?.appendChild(renderer.domElement);

        const loader = new GLTFLoader();

        loader.load('https://raw.githubusercontent.com/BachNewton/Novelty-Games/refs/heads/game-3D/models/sailboat/scene.gltf', (gltf) => {
            sailboat = gltf.scene;

            sailboat.scale.multiplyScalar(0.01);
            sailboat.rotateY(2 * Math.PI / 3);
            scene.add(sailboat);
        }, (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, (error) => {
            console.error(error);
        });
    }, []);

    return <div style={{ overflow: 'hidden', height: '100vh' }} ref={containerElement}></div>;
};

export default Game3D;
