import * as THREE from 'three';

export interface ForceConfig {
    springStrength: number;
    springLength: number;
    repulsionStrength: number;
    centeringStrength: number;
    damping: number;
    maxVelocity: number;
    stabilityThreshold: number;
}

interface SimNode {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    fixed: boolean;
}

export interface ForceSimulation {
    addNode: (id: string, initialPosition?: THREE.Vector3) => void;
    removeNode: (id: string) => void;
    addLink: (source: string, target: string) => void;
    update: (deltaTime: number) => void;
    getPosition: (id: string) => THREE.Vector3 | undefined;
    setNodeFixed: (id: string, fixed: boolean) => void;
    isStable: () => boolean;
    getNodeCount: () => number;
}

const DEFAULT_CONFIG: ForceConfig = {
    springStrength: 0.02,
    springLength: 8,
    repulsionStrength: 200,
    centeringStrength: 0.001,
    damping: 0.85,
    maxVelocity: 2,
    stabilityThreshold: 0.01
};

export function createForceSimulation(config: Partial<ForceConfig> = {}): ForceSimulation {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    const nodes = new Map<string, SimNode>();
    const links: Array<{ source: string; target: string }> = [];
    let stable = false;

    function randomPosition(): THREE.Vector3 {
        return new THREE.Vector3(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
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

            const displacement = distance - cfg.springLength;
            const springForce = delta.normalize().multiplyScalar(cfg.springStrength * displacement);

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
        const nodeIds = Array.from(nodes.keys());

        for (let i = 0; i < nodeIds.length; i++) {
            for (let j = i + 1; j < nodeIds.length; j++) {
                const nodeA = nodes.get(nodeIds[i])!;
                const nodeB = nodes.get(nodeIds[j])!;

                const delta = new THREE.Vector3().subVectors(nodeB.position, nodeA.position);
                const distanceSq = delta.lengthSq();
                if (distanceSq === 0) continue;

                const repulsion = cfg.repulsionStrength / distanceSq;
                const repulsionForce = delta.normalize().multiplyScalar(repulsion);

                if (!nodeA.fixed) {
                    const forceA = force.get(nodeIds[i]) ?? new THREE.Vector3();
                    forceA.sub(repulsionForce);
                    force.set(nodeIds[i], forceA);
                }

                if (!nodeB.fixed) {
                    const forceB = force.get(nodeIds[j]) ?? new THREE.Vector3();
                    forceB.add(repulsionForce);
                    force.set(nodeIds[j], forceB);
                }
            }
        }
    }

    function applyCenteringForces(force: Map<string, THREE.Vector3>): void {
        for (const [id, node] of nodes) {
            if (node.fixed) continue;

            const centeringForce = node.position.clone().multiplyScalar(-cfg.centeringStrength);
            const nodeForce = force.get(id) ?? new THREE.Vector3();
            nodeForce.add(centeringForce);
            force.set(id, nodeForce);
        }
    }

    return {
        addNode: (id, initialPosition) => {
            if (nodes.has(id)) return;

            let position: THREE.Vector3;
            if (initialPosition) {
                position = initialPosition.clone();
            } else if (nodes.size === 0) {
                position = new THREE.Vector3(0, 0, 0);
            } else {
                position = randomPosition();
            }

            nodes.set(id, {
                position,
                velocity: new THREE.Vector3(),
                fixed: false
            });
            stable = false;
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
                stable = false;
            }
        },

        update: (deltaTime) => {
            if (stable || nodes.size === 0) return;

            const dt = Math.min(deltaTime, 50) / 1000;
            const force = new Map<string, THREE.Vector3>();

            for (const id of nodes.keys()) {
                force.set(id, new THREE.Vector3());
            }

            applySpringForces(force);
            applyRepulsionForces(force);
            applyCenteringForces(force);

            let maxMovement = 0;

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
                maxMovement = Math.max(maxMovement, movement.length());
            }

            stable = maxMovement < cfg.stabilityThreshold;
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

        isStable: () => stable,

        getNodeCount: () => nodes.size
    };
}
