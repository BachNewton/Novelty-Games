import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GameWorld, GameWorldCreator } from "../GameWorld";

export const KnightWorld: GameWorldCreator = {
    create: (scene, camera, world, domElement, updateHUD, updateSummary) => createKnightWorld(scene, camera, world, domElement, updateHUD, updateSummary)
};

function createKnightWorld(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    world: CANNON.World,
    domElement: HTMLCanvasElement,
    updateHUD: (text: string) => void,
    updateSummary: (element: JSX.Element) => void
): GameWorld {
    return {
        update: (deltaTime) => {
            //
        }
    };
}
