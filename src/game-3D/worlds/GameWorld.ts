import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { KeyboardInput } from '../input/Keyboard';

export interface GameWorld {
    update(deltaTime: number): void;
}

export interface GameWorldCreator {
    create(scene: THREE.Scene, camera: THREE.PerspectiveCamera, world: CANNON.World, keyboardInput: KeyboardInput): GameWorld;
}
