import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { threeToCannon } from 'three-to-cannon';

export interface GameWorldObject {
    mesh: THREE.Mesh;
    body: CANNON.Body;
    update(): void;
}

interface Shape {
    type: 'box' | 'sphere';
}

interface BoxDimensions extends Shape {
    type: 'box';
    width: number;
    height: number;
    depth: number;
}

interface SphereDimensions extends Shape {
    type: 'sphere';
    radius: number;
}

type Dimensions = BoxDimensions | SphereDimensions;

interface GameWorldObjectOptions {
    dimensions: Dimensions;
    color: string;
    mass: number;
}

interface GameWorldObjectCreator {
    create(options: GameWorldObjectOptions): GameWorldObject;
}

export const GameWorldObjectCreator: GameWorldObjectCreator = {
    create: (options) => {
        const createGeometry = () => {
            const dimensions = options.dimensions;

            switch (dimensions.type) {
                case 'box':
                    return new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth);
                case 'sphere':
                    return new THREE.SphereGeometry(dimensions.radius);
            }
        };

        const geometry = createGeometry();
        const material = new THREE.MeshStandardMaterial({ color: options.color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

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
