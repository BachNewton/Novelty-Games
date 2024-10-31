import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { threeToCannon } from 'three-to-cannon';

interface GameWorldObject {
    mesh: THREE.Mesh;
    body: CANNON.Body;
    update(): void;
}

interface GameWorldObjectOptions {
    width: number;
    height: number;
    depth: number;
    color: string;
    mass: number;
}

interface GameWorldObjectCreator {
    create(options: GameWorldObjectOptions): GameWorldObject;
}

export const GameWorldObjectCreator: GameWorldObjectCreator = {
    create: (options) => {
        const geometry = new THREE.BoxGeometry(options.width, options.height, options.depth);
        const material = new THREE.MeshStandardMaterial({ color: options.color });
        const mesh = new THREE.Mesh(geometry, material);

        const results = threeToCannon(mesh)!;
        const body = new CANNON.Body({
            shape: results.shape,
            mass: options.mass
        });

        return {
            mesh: mesh,
            body: body,
            update: () => {
                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
            }
        };
    }
};
