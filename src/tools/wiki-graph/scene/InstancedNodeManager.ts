import * as THREE from 'three';

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

const INITIAL_CAPACITY = 5000;
const MISSING_COLOR = 0x666666;
const LEAF_COLOR = 0xffffff;

interface InstancedMeshData {
    mesh: THREE.InstancedMesh;
    count: number;
    needsUpdate: boolean;
}

function createGeometry(type: NodeType): THREE.BufferGeometry {
    switch (type) {
        case 'sphere':
            return new THREE.SphereGeometry(0.4, 16, 16);
        case 'box':
            return new THREE.BoxGeometry(0.5, 0.5, 0.5);
        case 'cone': {
            const geo = new THREE.ConeGeometry(0.3, 0.6, 4);
            geo.rotateX(Math.PI / 2); // Point in -Z direction
            return geo;
        }
    }
}

function createMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
        roughness: 0.5,
        metalness: 0.3
    });
}

function createHighlightMesh(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.55, 16, 16);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
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
            material.color.setHex(MISSING_COLOR);
        } else if (type === 'cone') {
            material.color.setHex(LEAF_COLOR);
        }

        const instancedMesh = new THREE.InstancedMesh(geometry, material, INITIAL_CAPACITY);
        instancedMesh.count = 0; // Start with 0 visible instances
        instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        // Enable per-instance colors for spheres (category colors)
        if (type === 'sphere') {
            instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(
                new Float32Array(INITIAL_CAPACITY * 3),
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

            if (index >= INITIAL_CAPACITY) {
                throw new Error(
                    `InstancedNodeManager: Exceeded buffer capacity of ${INITIAL_CAPACITY} for node type "${type}". ` +
                    `Consider increasing INITIAL_CAPACITY or reducing linkLimit/maxDepth.`
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
            const scale = type === 'cone' ? 0.8 : 1;
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
