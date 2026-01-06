import * as THREE from 'three';
import { NODE_CONFIG } from '../config/nodeConfig';

export type NodeType = 'sphere' | 'box' | 'cone';

export interface InstancedNodeManager {
    addNode: (type: NodeType, color: number) => number;
    setPosition: (type: NodeType, index: number, position: THREE.Vector3) => void;
    setColor: (type: NodeType, index: number, color: number) => void;
    setRotation: (type: NodeType, index: number, quaternion: THREE.Quaternion) => void;
    hideInstance: (type: NodeType, index: number) => void;
    setHighlighted: (type: NodeType, index: number, position: THREE.Vector3) => void;
    clearHighlight: () => void;
    getInstanceCount: (type: NodeType) => number;
    getMeshes: () => THREE.Object3D[];
    sync: () => void;
}


interface InstancedMeshData {
    mesh: THREE.InstancedMesh;
    count: number;
    needsUpdate: boolean;
}

function createGeometry(type: NodeType): THREE.BufferGeometry {
    switch (type) {
        case 'sphere':
            return new THREE.SphereGeometry(
                NODE_CONFIG.geometry.sphere.radius,
                NODE_CONFIG.geometry.sphere.segments,
                NODE_CONFIG.geometry.sphere.segments
            );
        case 'box': {
            const size = NODE_CONFIG.geometry.box.size;
            return new THREE.BoxGeometry(size, size, size);
        }
        case 'cone': {
            const geo = new THREE.ConeGeometry(
                NODE_CONFIG.geometry.cone.radius,
                NODE_CONFIG.geometry.cone.height,
                NODE_CONFIG.geometry.cone.segments
            );
            geo.rotateX(Math.PI / 2); // Point in -Z direction
            return geo;
        }
    }
}

function createMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
        roughness: NODE_CONFIG.materials.roughness,
        metalness: NODE_CONFIG.materials.metalness
    });
}

function createHighlightMesh(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(
        NODE_CONFIG.highlight.sphereRadius,
        NODE_CONFIG.geometry.sphere.segments,
        NODE_CONFIG.geometry.sphere.segments
    );
    const material = new THREE.MeshBasicMaterial({
        color: NODE_CONFIG.highlight.color,
        transparent: true,
        opacity: NODE_CONFIG.highlight.opacity,
        side: THREE.BackSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.visible = false;
    return mesh;
}

export function createInstancedNodeManager(): InstancedNodeManager {
    const meshes = new Map<NodeType, InstancedMeshData>();
    const tempMatrix = new THREE.Matrix4();
    const tempColor = new THREE.Color();

    // Create instanced meshes for each type
    const types: NodeType[] = ['sphere', 'box', 'cone'];
    for (const type of types) {
        const geometry = createGeometry(type);
        const material = createMaterial();

        // Set default color based on type
        if (type === 'box') {
            material.color.setHex(NODE_CONFIG.colors.missing);
        } else if (type === 'cone') {
            material.color.setHex(NODE_CONFIG.colors.leaf);
        }

        const instancedMesh = new THREE.InstancedMesh(geometry, material, NODE_CONFIG.capacity.initial);
        instancedMesh.count = 0; // Start with 0 visible instances
        instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        // Enable per-instance colors for spheres (category colors)
        if (type === 'sphere') {
            instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(
                new Float32Array(NODE_CONFIG.capacity.initial * 3),
                3
            );
            instancedMesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
        }

        meshes.set(type, {
            mesh: instancedMesh,
            count: 0,
            needsUpdate: false
        });
    }

    // Highlight overlay mesh
    const highlightMesh = createHighlightMesh();

    return {
        addNode: (type, color) => {
            const data = meshes.get(type)!;
            const index = data.count;

            if (index >= NODE_CONFIG.capacity.initial) {
                throw new Error(
                    `InstancedNodeManager: Exceeded buffer capacity of ${NODE_CONFIG.capacity.initial} for node type "${type}". ` +
                    `Consider increasing capacity.initial or reducing linkLimit/maxDepth.`
                );
            }

            data.count++;
            data.mesh.count = data.count;

            // Set initial transform (identity, will be updated)
            tempMatrix.identity();
            data.mesh.setMatrixAt(index, tempMatrix);

            // Set color for spheres
            if (type === 'sphere' && data.mesh.instanceColor) {
                tempColor.setHex(color);
                data.mesh.instanceColor.setXYZ(index, tempColor.r, tempColor.g, tempColor.b);
                data.mesh.instanceColor.needsUpdate = true;
            }

            data.needsUpdate = true;
            return index;
        },

        setPosition: (type, index, position) => {
            const data = meshes.get(type)!;
            if (index >= data.count) return;

            // Get current matrix, update position, set back
            data.mesh.getMatrixAt(index, tempMatrix);
            tempMatrix.setPosition(position);
            data.mesh.setMatrixAt(index, tempMatrix);
            data.needsUpdate = true;
        },

        setColor: (type, index, color) => {
            const data = meshes.get(type)!;
            if (type !== 'sphere' || !data.mesh.instanceColor) return;
            if (index >= data.count) return;

            tempColor.setHex(color);
            data.mesh.instanceColor.setXYZ(index, tempColor.r, tempColor.g, tempColor.b);
            data.mesh.instanceColor.needsUpdate = true;
        },

        setRotation: (type, index, quaternion) => {
            const data = meshes.get(type)!;
            if (index >= data.count) return;

            data.mesh.getMatrixAt(index, tempMatrix);
            const position = new THREE.Vector3();
            const scale = new THREE.Vector3();
            tempMatrix.decompose(position, new THREE.Quaternion(), scale);
            tempMatrix.compose(position, quaternion, scale);
            data.mesh.setMatrixAt(index, tempMatrix);
            data.needsUpdate = true;
        },

        hideInstance: (type, index) => {
            const data = meshes.get(type)!;
            if (index >= data.count) return;

            // Scale to 0 to hide the instance
            tempMatrix.makeScale(0, 0, 0);
            data.mesh.setMatrixAt(index, tempMatrix);
            data.needsUpdate = true;
        },

        setHighlighted: (type, index, position) => {
            highlightMesh.visible = true;
            highlightMesh.position.copy(position);

            // Adjust size based on node type
            const scale = type === 'cone' ? NODE_CONFIG.highlight.coneScale : 1;
            highlightMesh.scale.setScalar(scale);
        },

        clearHighlight: () => {
            highlightMesh.visible = false;
        },

        getInstanceCount: (type) => {
            return meshes.get(type)!.count;
        },

        getMeshes: () => {
            const result: THREE.Object3D[] = [];
            for (const data of meshes.values()) {
                result.push(data.mesh);
            }
            result.push(highlightMesh);
            return result;
        },

        sync: () => {
            for (const data of meshes.values()) {
                if (data.needsUpdate) {
                    data.mesh.instanceMatrix.needsUpdate = true;
                    // Recompute bounding sphere for raycasting to work at all positions
                    data.mesh.computeBoundingSphere();
                    data.needsUpdate = false;
                }
            }
        }
    };
}
