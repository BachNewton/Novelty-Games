import * as THREE from 'three';
import { LOADING_INDICATOR_CONFIG } from '../config/loadingIndicatorConfig';

export interface LoadingIndicator {
    ring: THREE.Mesh;
    pending: Set<string>;
}

export function createLoadingIndicator(): THREE.Mesh {
    const ringGeometry = new THREE.TorusGeometry(
        LOADING_INDICATOR_CONFIG.geometry.majorRadius,
        LOADING_INDICATOR_CONFIG.geometry.tubeRadius,
        LOADING_INDICATOR_CONFIG.geometry.tubeSegments,
        LOADING_INDICATOR_CONFIG.geometry.radialSegments
    );
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: LOADING_INDICATOR_CONFIG.color,
        transparent: true,
        opacity: LOADING_INDICATOR_CONFIG.material.opacity
    });
    return new THREE.Mesh(ringGeometry, ringMaterial);
}

export function rotateIndicator(ring: THREE.Mesh, deltaTime: number): void {
    ring.rotation.x += deltaTime * LOADING_INDICATOR_CONFIG.animation.rotationSpeed.x;
    ring.rotation.y += deltaTime * LOADING_INDICATOR_CONFIG.animation.rotationSpeed.y;
}
