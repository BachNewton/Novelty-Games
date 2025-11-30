import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export interface Marble {
    mesh: THREE.Mesh;
    body: CANNON.Body;
    scored: boolean;
    pointsEarned?: number;
    checkHoles?: () => void;
}

export interface ScoringHole {
    position: THREE.Vector3;
    points: number;
    body: CANNON.Body;
    mesh: THREE.Mesh;
}

export const MARBLE_RADIUS = 0.15;
export const PIN_RADIUS = 0.05;
export const PIN_HEIGHT = 0.3;
export const LAUNCHER_POWER = 15;
export const TOTAL_MARBLES = 10;
export const BOARD_ANGLE = -Math.PI / 6;
export const BOARD_CENTER_Y = 2;
export const BOARD_THICKNESS = 0.2;

