import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export interface GameWorld {
    update(deltaTime: number): void;
}

export interface GameWorldCreator {
    create(scene: THREE.Scene, camera: THREE.PerspectiveCamera, world: CANNON.World, domElement: HTMLCanvasElement, updateHUD: (text: string) => void): GameWorld;
}
