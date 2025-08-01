import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { RoundedBoxGeometry } from 'three/examples/jsm/Addons';
import { threeToCannon } from 'three-to-cannon';

export interface GameWorldObject {
    mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    body: CANNON.Body;
    update(deltaTime?: number): void;
    add(scene: THREE.Scene, world: CANNON.World): void;
    remove(scene: THREE.Scene, world: CANNON.World): void;
}

interface Shape {
    type: 'box' | 'sphere';
}

interface BoxDimensions extends Shape {
    type: 'box';
    width: number;
    height: number;
    depth: number;
    radius?: number;
}

interface SphereDimensions extends Shape {
    type: 'sphere';
    radius: number;
}

export type Dimensions = BoxDimensions | SphereDimensions;

interface MaterialType {
    type: 'color' | 'texturePath' | 'texture';
}

interface ColorMaterial extends MaterialType {
    type: 'color';
    color: THREE.ColorRepresentation;
}

interface TexturePathMaterial extends MaterialType {
    type: 'texturePath';
    texturePath: string;
    normalMapPath?: string;
}

interface TextureMaterial extends MaterialType {
    type: 'texture';
    texture: THREE.Texture;
    opacity: number;
}

type VisualMaterial = ColorMaterial | TexturePathMaterial | TextureMaterial;

interface GameWorldObjectOptions {
    dimensions: Dimensions;
    visualMaterial: VisualMaterial;
    physicalMaterial?: CANNON.Material;
    mass: number;
}

interface GameWorldObjectCreator {
    create(options: GameWorldObjectOptions): GameWorldObject;
}

export const gameWorldObjectCreator: GameWorldObjectCreator = {
    create: (options) => {
        const createGeometry = () => {
            const dimensions = options.dimensions;

            switch (dimensions.type) {
                case 'box':
                    return new RoundedBoxGeometry(dimensions.width, dimensions.height, dimensions.depth, undefined, dimensions.radius ?? 0);
                case 'sphere':
                    return new THREE.SphereGeometry(dimensions.radius);
            }
        };

        const createMaterial = () => {
            const material = options.visualMaterial;

            switch (material.type) {
                case 'color':
                    return new THREE.MeshStandardMaterial({ color: material.color });
                case 'texturePath':
                    const loader = new THREE.TextureLoader();
                    const texture = loader.load(material.texturePath);
                    const normalMap = material.normalMapPath ? loader.load(material.normalMapPath) : undefined;
                    return new THREE.MeshStandardMaterial({ map: texture, normalMap: normalMap });
                case 'texture':
                    return new THREE.MeshStandardMaterial({ map: material.texture, transparent: true, opacity: material.opacity });
            }
        };

        const mesh = new THREE.Mesh(createGeometry(), createMaterial());
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const results = threeToCannon(mesh)!;
        const body = new CANNON.Body({
            shape: results.shape,
            mass: options.mass,
            material: options.physicalMaterial
        });

        return {
            mesh: mesh,
            body: body,
            update: () => {
                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
            },
            add: (scene, world) => {
                scene.add(mesh);
                world.addBody(body);
            },
            remove: (scene, world) => {
                scene.remove(mesh);
                world.removeBody(body);
            }
        };
    }
};
