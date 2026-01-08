import * as THREE from 'three';

interface OctreeNode {
    // Bounding box
    centerX: number;
    centerY: number;
    centerZ: number;
    size: number;

    // Mass properties (for Barnes-Hut)
    mass: number;  // Number of nodes in this cell
    comX: number;  // Center of mass X
    comY: number;  // Center of mass Y
    comZ: number;  // Center of mass Z

    // Children (null if leaf or empty)
    children: (OctreeNode | null)[] | null;

    // Leaf data (only set if this is a leaf with exactly one node)
    nodeId: string | null;
}

export interface Octree {
    build: (nodes: Map<string, { position: THREE.Vector3 }>) => void;
    calculateForce: (position: THREE.Vector3, excludeId: string, theta: number, strength: number) => THREE.Vector3;
}

export function createOctree(): Octree {
    let root: OctreeNode | null = null;

    function createNode(centerX: number, centerY: number, centerZ: number, size: number): OctreeNode {
        return {
            centerX,
            centerY,
            centerZ,
            size,
            mass: 0,
            comX: 0,
            comY: 0,
            comZ: 0,
            children: null,
            nodeId: null
        };
    }

    function getOctant(node: OctreeNode, x: number, y: number, z: number): number {
        let octant = 0;
        if (x >= node.centerX) octant |= 1;
        if (y >= node.centerY) octant |= 2;
        if (z >= node.centerZ) octant |= 4;
        return octant;
    }

    function getChildCenter(parent: OctreeNode, octant: number): { x: number; y: number; z: number } {
        const offset = parent.size / 4;
        return {
            x: parent.centerX + ((octant & 1) ? offset : -offset),
            y: parent.centerY + ((octant & 2) ? offset : -offset),
            z: parent.centerZ + ((octant & 4) ? offset : -offset)
        };
    }

    function insert(node: OctreeNode, id: string, x: number, y: number, z: number): void {
        // Update center of mass
        const totalMass = node.mass + 1;
        node.comX = (node.comX * node.mass + x) / totalMass;
        node.comY = (node.comY * node.mass + y) / totalMass;
        node.comZ = (node.comZ * node.mass + z) / totalMass;
        node.mass = totalMass;

        // If this is an empty node, make it a leaf
        if (node.mass === 1 && node.children === null) {
            node.nodeId = id;
            return;
        }

        // If this is a leaf with one node, we need to subdivide
        if (node.nodeId !== null) {
            const existingId = node.nodeId;

            // Recalculate existing node position from old center of mass
            // mass was 1 before update, so old COM = old position
            // We already updated COM, so reverse: oldPos = (newCOM * newMass - newPos) / oldMass
            const oldMass = node.mass - 1;
            const oldX = (node.comX * node.mass - x) / oldMass;
            const oldY = (node.comY * node.mass - y) / oldMass;
            const oldZ = (node.comZ * node.mass - z) / oldMass;

            node.children = [null, null, null, null, null, null, null, null];
            node.nodeId = null;

            // Re-insert the existing node
            insertIntoChild(node, existingId, oldX, oldY, oldZ);
        }

        // Ensure children array exists
        if (node.children === null) {
            node.children = [null, null, null, null, null, null, null, null];
        }

        // Insert the new node into the appropriate child
        insertIntoChild(node, id, x, y, z);
    }

    function insertIntoChild(parent: OctreeNode, id: string, x: number, y: number, z: number): void {
        const octant = getOctant(parent, x, y, z);

        if (parent.children![octant] === null) {
            const childCenter = getChildCenter(parent, octant);
            parent.children![octant] = createNode(childCenter.x, childCenter.y, childCenter.z, parent.size / 2);
        }

        insert(parent.children![octant]!, id, x, y, z);
    }

    function calculateForceFromNode(
        node: OctreeNode,
        px: number,
        py: number,
        pz: number,
        excludeId: string,
        theta: number,
        strength: number,
        force: THREE.Vector3
    ): void {
        if (node.mass === 0) return;

        const dx = node.comX - px;
        const dy = node.comY - py;
        const dz = node.comZ - pz;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq === 0) return;

        const dist = Math.sqrt(distSq);

        // Barnes-Hut criterion: if size/distance < theta, treat as single mass
        // Or if this is a leaf node
        if (node.size / dist < theta || (node.children === null && node.nodeId !== null)) {
            // Skip if this is the node we're calculating force for
            if (node.nodeId === excludeId) return;

            // Calculate repulsion force: F = strength * mass / dist^2
            // Direction: from COM towards position (repulsion)
            const forceMag = strength * node.mass / distSq;
            force.x -= dx / dist * forceMag;
            force.y -= dy / dist * forceMag;
            force.z -= dz / dist * forceMag;
        } else if (node.children !== null) {
            // Recurse into children
            for (const child of node.children) {
                if (child !== null) {
                    calculateForceFromNode(child, px, py, pz, excludeId, theta, strength, force);
                }
            }
        }
    }

    return {
        build: (nodes) => {
            if (nodes.size === 0) {
                root = null;
                return;
            }

            // Compute bounding box from node positions
            let minX = Infinity, minY = Infinity, minZ = Infinity;
            let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

            for (const [, node] of nodes) {
                const p = node.position;
                minX = Math.min(minX, p.x);
                minY = Math.min(minY, p.y);
                minZ = Math.min(minZ, p.z);
                maxX = Math.max(maxX, p.x);
                maxY = Math.max(maxY, p.y);
                maxZ = Math.max(maxZ, p.z);
            }

            // Add padding and make it a cube (octree needs cubic bounds)
            const padding = 1;
            const sizeX = maxX - minX + padding * 2;
            const sizeY = maxY - minY + padding * 2;
            const sizeZ = maxZ - minZ + padding * 2;
            const size = Math.max(sizeX, sizeY, sizeZ, 1); // At least size 1

            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const centerZ = (minZ + maxZ) / 2;

            root = createNode(centerX, centerY, centerZ, size);

            // Insert all nodes
            for (const [id, node] of nodes) {
                insert(root, id, node.position.x, node.position.y, node.position.z);
            }
        },

        calculateForce: (position, excludeId, theta, strength) => {
            const force = new THREE.Vector3(0, 0, 0);

            if (root === null) return force;

            calculateForceFromNode(root, position.x, position.y, position.z, excludeId, theta, strength, force);

            return force;
        }
    };
}
