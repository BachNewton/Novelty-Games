import * as THREE from 'three';
import { PHYSICS_CONFIG } from '../config/physicsConfig';
import { DEBUG_CONFIG } from '../config/debugConfig';
import { createOctree } from '../util/Octree';

export interface ForceConfig {
    springStrength: number;
    repulsionStrength: number;
    damping: number;
    maxVelocity: number;
    barnesHutTheta: number;
}

interface SimNode {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    fixed: boolean;
}

interface AddNodeOptions {
    parentId?: string;
    position?: THREE.Vector3;
}

export interface ForceSimulation {
    addNode: (id: string, options?: AddNodeOptions) => void;
    removeNode: (id: string) => void;
    addLink: (source: string, target: string) => void;
    update: (deltaTime: number) => void;
    getPosition: (id: string) => THREE.Vector3 | undefined;
    setNodeFixed: (id: string, fixed: boolean) => void;
    getNodeCount: () => number;
    updateConfig: (config: Partial<ForceConfig>) => void;
}

const DEFAULT_CONFIG: ForceConfig = {
    springStrength: PHYSICS_CONFIG.springStrength,
    repulsionStrength: PHYSICS_CONFIG.repulsionStrength,
    damping: PHYSICS_CONFIG.damping,
    maxVelocity: PHYSICS_CONFIG.maxVelocity,
    barnesHutTheta: PHYSICS_CONFIG.barnesHutTheta
};

export function createForceSimulation(config: Partial<ForceConfig> = {}): ForceSimulation {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    const nodes = new Map<string, SimNode>();
    const links: Array<{ source: string; target: string }> = [];
    const octree = createOctree();

    function positionNearParent(parentId: string | undefined): THREE.Vector3 {
        const parent = parentId ? nodes.get(parentId) : undefined;
        if (!parent) {
            return new THREE.Vector3(0, 0, 0);
        }
        const range = PHYSICS_CONFIG.spawnOffsetRange;
        return new THREE.Vector3(
            parent.position.x + (Math.random() - 0.5) * range,
            parent.position.y + (Math.random() - 0.5) * range,
            parent.position.z + (Math.random() - 0.5) * range
        );
    }

    function applySpringForces(force: Map<string, THREE.Vector3>): void {
        for (const link of links) {
            const sourceNode = nodes.get(link.source);
            const targetNode = nodes.get(link.target);
            if (!sourceNode || !targetNode) continue;

            const delta = new THREE.Vector3().subVectors(targetNode.position, sourceNode.position);
            const distance = delta.length();
            if (distance === 0) continue;

            // Spring length is 0, so displacement equals distance
            const springForce = delta.normalize().multiplyScalar(cfg.springStrength * distance);

            if (!sourceNode.fixed) {
                const sourceForce = force.get(link.source) ?? new THREE.Vector3();
                sourceForce.add(springForce);
                force.set(link.source, sourceForce);
            }

            if (!targetNode.fixed) {
                const targetForce = force.get(link.target) ?? new THREE.Vector3();
                targetForce.sub(springForce);
                force.set(link.target, targetForce);
            }
        }
    }

    function applyRepulsionForces(force: Map<string, THREE.Vector3>): void {
        // Build octree from current positions
        octree.build(nodes);

        // Calculate repulsion for each node using Barnes-Hut
        for (const [id, node] of nodes) {
            if (node.fixed) continue;

            const repulsionForce = octree.calculateForce(
                node.position,
                id,
                cfg.barnesHutTheta,
                cfg.repulsionStrength
            );

            const nodeForce = force.get(id) ?? new THREE.Vector3();
            nodeForce.add(repulsionForce);
            force.set(id, nodeForce);
        }
    }

    return {
        addNode: (id, options) => {
            if (nodes.has(id)) return;

            const position = options?.position
                ? options.position.clone()
                : positionNearParent(options?.parentId);

            nodes.set(id, {
                position,
                velocity: new THREE.Vector3(),
                fixed: false
            });
        },

        removeNode: (id) => {
            nodes.delete(id);
            for (let i = links.length - 1; i >= 0; i--) {
                if (links[i].source === id || links[i].target === id) {
                    links.splice(i, 1);
                }
            }
        },

        addLink: (source, target) => {
            if (!links.some(l => l.source === source && l.target === target)) {
                links.push({ source, target });
            }
        },

        update: (deltaTime) => {
            if (DEBUG_CONFIG.disablePhysics) return;

            const dt = Math.min(deltaTime, PHYSICS_CONFIG.maxDeltaTimeMs) / 1000;
            const force = new Map<string, THREE.Vector3>();

            for (const id of nodes.keys()) {
                force.set(id, new THREE.Vector3());
            }

            applySpringForces(force);
            applyRepulsionForces(force);

            for (const [id, node] of nodes) {
                if (node.fixed) continue;

                const nodeForce = force.get(id);
                if (!nodeForce) continue;

                node.velocity.add(nodeForce.multiplyScalar(dt));
                node.velocity.multiplyScalar(cfg.damping);

                if (node.velocity.length() > cfg.maxVelocity) {
                    node.velocity.setLength(cfg.maxVelocity);
                }

                const movement = node.velocity.clone().multiplyScalar(dt);
                node.position.add(movement);
            }
        },

        getPosition: (id) => {
            return nodes.get(id)?.position.clone();
        },

        setNodeFixed: (id, fixed) => {
            const node = nodes.get(id);
            if (node) {
                node.fixed = fixed;
            }
        },

        getNodeCount: () => nodes.size,

        updateConfig: (config) => {
            Object.assign(cfg, config);
        }
    };
}
