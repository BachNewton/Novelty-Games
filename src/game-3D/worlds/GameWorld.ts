import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export interface GameWorld {
    update(deltaTime: number): void;
}

export interface GameWorldCreator {
    create(scene: THREE.Scene, world: CANNON.World): GameWorld;
}
