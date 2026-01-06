import * as THREE from 'three';
import { LINK_CONFIG } from '../config/linkConfig';

export type LinkType = 'directional' | 'bidirectional';

export interface InstancedLinkManager {
    addLink: (type: LinkType) => number;
    updateTransform: (type: LinkType, index: number, sourcePos: THREE.Vector3, targetPos: THREE.Vector3) => void;
    getInstanceCount: (type: LinkType) => number;
    getMeshes: () => THREE.InstancedMesh[];
    sync: () => void;
}

function createDirectionalGeometry(): THREE.CylinderGeometry {
    // Tapered cylinder: thin at bottom (source), thick at top (target)
    const geometry = new THREE.CylinderGeometry(
        LINK_CONFIG.geometry.targetRadius,
        LINK_CONFIG.geometry.sourceRadius,
        1,
        LINK_CONFIG.geometry.radialSegments,
        1
    );

    const sourceColor = new THREE.Color(LINK_CONFIG.colors.directional);
    const targetColor = new THREE.Color(LINK_CONFIG.colors.target);

    // Shift geometry so bottom is at origin (easier transform math)
    geometry.translate(0, 0.5, 0);

    // Add vertex colors for gradient effect (orange → cyan)
    const positions = geometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i); // 0 at bottom (source), 1 at top (target)
        const color = sourceColor.clone().lerp(targetColor, y);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return geometry;
}

function createBidirectionalGeometry(): THREE.CylinderGeometry {
    // Slightly thicker cylinder to cover directional link underneath
    const geometry = new THREE.CylinderGeometry(
        LINK_CONFIG.geometry.bidirectionalRadius,
        LINK_CONFIG.geometry.bidirectionalRadius,
        1,
        LINK_CONFIG.geometry.radialSegments,
        1
    );
    geometry.translate(0, 0.5, 0);

    // Solid purple color
    const bidirectionalColor = new THREE.Color(LINK_CONFIG.colors.bidirectional);
    const positions = geometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
        colors[i * 3] = bidirectionalColor.r;
        colors[i * 3 + 1] = bidirectionalColor.g;
        colors[i * 3 + 2] = bidirectionalColor.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return geometry;
}

interface MeshData {
    mesh: THREE.InstancedMesh;
    count: number;
    needsUpdate: boolean;
}

export function createInstancedLinkManager(): InstancedLinkManager {
    const material = new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: LINK_CONFIG.materials.opacity
    });

    // Create both mesh types
    const meshes = new Map<LinkType, MeshData>();

    const directionalMesh = new THREE.InstancedMesh(
        createDirectionalGeometry(),
        material,
        LINK_CONFIG.capacity.initial
    );
    directionalMesh.count = 0;
    directionalMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    meshes.set('directional', { mesh: directionalMesh, count: 0, needsUpdate: false });

    const bidirectionalMesh = new THREE.InstancedMesh(
        createBidirectionalGeometry(),
        material.clone(), // Clone so they can have independent settings if needed
        LINK_CONFIG.capacity.initial
    );
    bidirectionalMesh.count = 0;
    bidirectionalMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    meshes.set('bidirectional', { mesh: bidirectionalMesh, count: 0, needsUpdate: false });

    // Reusable objects for transform calculation
    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const tempQuaternion = new THREE.Quaternion();
    const tempScale = new THREE.Vector3();
    const upVector = new THREE.Vector3(0, 1, 0);
    const direction = new THREE.Vector3();

    return {
        addLink: (type) => {
            const data = meshes.get(type)!;
            const index = data.count;

            if (index >= LINK_CONFIG.capacity.initial) {
                throw new Error(
                    `InstancedLinkManager: Exceeded buffer capacity of ${LINK_CONFIG.capacity.initial} for link type "${type}". ` +
                    `Consider increasing capacity.initial or reducing linkLimit/maxDepth.`
                );
            }

            data.count++;
            data.mesh.count = data.count;

            // Set initial identity transform
            tempMatrix.identity();
            data.mesh.setMatrixAt(index, tempMatrix);
            data.needsUpdate = true;

            return index;
        },

        updateTransform: (type, index, sourcePos, targetPos) => {
            const data = meshes.get(type)!;
            if (index >= data.count) return;

            // Calculate direction and distance
            direction.subVectors(targetPos, sourcePos);
            const distance = direction.length();

            if (distance === 0) return;

            direction.normalize();

            // Position at source
            tempPosition.copy(sourcePos);

            // Rotation to point from source to target
            tempQuaternion.setFromUnitVectors(upVector, direction);

            // Scale Y to match distance
            tempScale.set(1, distance, 1);

            // Compose transform matrix
            tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
            data.mesh.setMatrixAt(index, tempMatrix);
            data.needsUpdate = true;
        },

        getInstanceCount: (type) => meshes.get(type)!.count,

        getMeshes: () => [directionalMesh, bidirectionalMesh],

        sync: () => {
            for (const data of meshes.values()) {
                if (data.needsUpdate) {
                    data.mesh.instanceMatrix.needsUpdate = true;
                    data.mesh.computeBoundingSphere();
                    data.needsUpdate = false;
                }
            }
        }
    };
}
