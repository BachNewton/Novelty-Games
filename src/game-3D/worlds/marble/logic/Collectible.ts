import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GameWorldObject } from "../../GameWorldObject";

const HIT_BOX_RADIUS = 2.1;
const VISUAL_RADIUS = 0.9;
const ROTATIONAL_SPEED = 0.001;

export function createCollectible(): GameWorldObject {
    const mesh = new THREE.Mesh(
        new THREE.TorusKnotGeometry(VISUAL_RADIUS, 0.2, 128, 16, 1, 4),
        new THREE.MeshStandardMaterial({ color: 'magenta', roughness: 0.25, metalness: 0.75 })
    );

    // Removed the light because has been causing performance issues
    // mesh.add(new THREE.PointLight(undefined, 3));

    // Helpful for debugging. Renders the hit box sphere of the collectible.
    // mesh.add(new THREE.Mesh(new THREE.SphereGeometry(HIT_BOX_RADIUS), new THREE.MeshBasicMaterial({ color: 'white', opacity: 0.5, transparent: true })));

    const body = new CANNON.Body({
        shape: new CANNON.Sphere(HIT_BOX_RADIUS),
        collisionResponse: false,
        mass: 0
    });

    const deltaQuaternion = new CANNON.Quaternion();

    const rotateBody = (deltaTime: number) => {
        const deltaRotationX = ROTATIONAL_SPEED * deltaTime;
        const deltaRotationY = ROTATIONAL_SPEED * deltaTime;
        const deltaRotationZ = ROTATIONAL_SPEED * deltaTime;

        deltaQuaternion.setFromEuler(deltaRotationX, deltaRotationY, deltaRotationZ);

        body.quaternion.mult(deltaQuaternion, body.quaternion);
    };

    return {
        mesh: mesh,
        body: body,
        update: (deltaTime) => {
            if (deltaTime !== undefined) {
                rotateBody(deltaTime);
            }

            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
        },
        add: () => { } // Not used, but should be used.
    }
}
