import { GameWorldCreator } from "../GameWorld";
import * as THREE from 'three';
import { GameWorldObjectCreator } from "../GameWorldObject";

const MarbleWorld: GameWorldCreator = {
    create: (scene, world) => {
        addLight(scene);

        const floor = GameWorldObjectCreator.create({
            width: 15,
            height: 1,
            depth: 15,
            color: 'white',
            mass: 0
        });

        scene.add(floor.mesh);
        world.addBody(floor.body);

        return {
            update: (deltaTime) => {
                floor.update()
            }
        };
    }
};

function addLight(scene: THREE.Scene) {
    const ambientLight = new THREE.AmbientLight();

    const directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set(1, 1, 1);

    scene.add(ambientLight);
    scene.add(directionalLight);
}

export default MarbleWorld;
