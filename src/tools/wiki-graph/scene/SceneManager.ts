import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import Stats from 'three/examples/jsm/libs/stats.module';
import { SCENE_CONFIG } from '../config/sceneConfig';

export const DEFAULT_CAMERA_DISTANCE = SCENE_CONFIG.camera.defaultDistance;

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
    scene.background = new THREE.Color(SCENE_CONFIG.background.color);

    const camera = new THREE.PerspectiveCamera(
        SCENE_CONFIG.camera.fov,
        window.innerWidth / window.innerHeight,
        SCENE_CONFIG.camera.nearPlane,
        SCENE_CONFIG.camera.farPlane
    );
    camera.position.set(0, 0, DEFAULT_CAMERA_DISTANCE);

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

    const ambientLight = new THREE.AmbientLight(
        SCENE_CONFIG.lighting.ambient.color,
        SCENE_CONFIG.lighting.ambient.intensity
    );
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
        SCENE_CONFIG.lighting.directional.color,
        SCENE_CONFIG.lighting.directional.intensity
    );
    const lightPos = SCENE_CONFIG.lighting.directional.position;
    directionalLight.position.set(lightPos.x, lightPos.y, lightPos.z);
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = SCENE_CONFIG.controls.dampingFactor;
    controls.minDistance = SCENE_CONFIG.controls.minDistance;
    controls.maxDistance = SCENE_CONFIG.controls.maxDistance;

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
