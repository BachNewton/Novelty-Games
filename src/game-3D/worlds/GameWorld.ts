import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export interface GameWorld {
    update(deltaTime: number): void;
}

export interface GameWorldCreator {
    create(scene: THREE.Scene, camera: THREE.PerspectiveCamera, world: CANNON.World, orbitControls: OrbitControls): GameWorld;
}
