import { GameWorldCreator } from "../GameWorld";
import * as THREE from 'three';
import { GameWorldObject, GameWorldObjectCreator } from "../GameWorldObject";
import { randomNum } from "../../../util/Randomizer";

const MarbleWorld: GameWorldCreator = {
    create: (scene, world) => {
        addLight(scene);

        const gameWorldObjects: GameWorldObject[] = [];

        const floor = GameWorldObjectCreator.create({
            dimensions: {
                type: 'box',
                width: 15,
                height: 1,
                depth: 15
            },
            color: 'white',
            mass: 0
        });

        scene.add(floor.mesh);
        world.addBody(floor.body);
        gameWorldObjects.push(floor);

        setInterval(() => {
            const ball = GameWorldObjectCreator.create({
                dimensions: {
                    type: 'sphere',
                    radius: 0.5
                },
                color: 'yellow',
                mass: 1
            });

            ball.body.position.set(randomNum(-7, 7), 10, randomNum(-7, 7));

            scene.add(ball.mesh);
            world.addBody(ball.body);
            gameWorldObjects.push(ball);

        }, 750);

        return {
            update: (deltaTime) => {
                for (const gameWorldObject of gameWorldObjects) {
                    gameWorldObject.update();
                }
            }
        };
    }
};

function addLight(scene: THREE.Scene) {
    const ambientLight = new THREE.AmbientLight();

    const directionalLight = new THREE.DirectionalLight();
    directionalLight.castShadow = true;
    directionalLight.position.set(50, 50, 50);
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;

    scene.add(ambientLight);
    scene.add(directionalLight);

    // scene.add(new THREE.DirectionalLightHelper(directionalLight));
    // scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));
}

export default MarbleWorld;
