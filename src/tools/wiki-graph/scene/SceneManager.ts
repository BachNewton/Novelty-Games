import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import Stats from 'three/examples/jsm/libs/stats.module';

export interface SceneComponents {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    labelRenderer: CSS2DRenderer;
    controls: OrbitControls;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    stats: Stats;
}

export interface SceneManager {
    getComponents: () => SceneComponents;
    handleResize: () => void;
    dispose: () => void;
}

export function createSceneManager(container: HTMLDivElement): SceneManager {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );
    camera.position.set(0, 0, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(labelRenderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 200;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const stats = new Stats();
    container.appendChild(stats.dom);

    const components: SceneComponents = {
        scene, camera, renderer, labelRenderer, controls, raycaster, mouse, stats
    };

    return {
        getComponents: () => components,

        handleResize: () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            labelRenderer.setSize(window.innerWidth, window.innerHeight);
        },

        dispose: () => {
            renderer.setAnimationLoop(null);
            renderer.dispose();
            container.removeChild(renderer.domElement);
            container.removeChild(labelRenderer.domElement);
            container.removeChild(stats.dom);
        }
    };
}
