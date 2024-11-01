import { GameWorldCreator } from "../GameWorld";
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GameWorldObject, GameWorldObjectCreator } from "../GameWorldObject";
import { randomNum } from "../../../util/Randomizer";
import PlayerTexture from './textures/player.png';

const PLAYER_SPEED = 0.5;

const MarbleWorld: GameWorldCreator = {
    create: (scene, world, keyboardInput) => {
        addLight(scene);

        const gameWorldObjects: GameWorldObject[] = [];

        const floor = GameWorldObjectCreator.create({
            dimensions: {
                type: 'box',
                width: 15,
                height: 1,
                depth: 15
            },
            material: {
                type: 'color',
                color: 'lightblue'
            },
            mass: 0
        });

        scene.add(floor.mesh);
        world.addBody(floor.body);
        gameWorldObjects.push(floor);

        const player = GameWorldObjectCreator.create({
            dimensions: {
                type: 'sphere',
                radius: 0.5
            },
            material: {
                type: 'texture',
                texturePath: PlayerTexture
            },
            mass: 1
        });

        player.body.position.y = 2;
        const playerTorque = new CANNON.Vec3();

        scene.add(player.mesh);
        world.addBody(player.body);
        gameWorldObjects.push(player);

        setInterval(() => {
            const ball = GameWorldObjectCreator.create({
                dimensions: {
                    type: 'sphere',
                    radius: 0.5
                },
                material: {
                    type: 'color',
                    color: 'yellow'
                },
                mass: 1
            });

            ball.body.position.set(randomNum(-7, 7), 10, randomNum(-7, 7));

            scene.add(ball.mesh);
            world.addBody(ball.body);
            gameWorldObjects.push(ball);

        }, 750);

        return {
            update: (deltaTime) => {
                if (keyboardInput.held.KeyW) {
                    playerTorque.scale(deltaTime * PLAYER_SPEED, playerTorque.set(-1, 0, 0));
                    player.body.applyTorque(playerTorque);
                }

                if (keyboardInput.held.KeyS) {
                    playerTorque.scale(deltaTime * PLAYER_SPEED, playerTorque.set(1, 0, 0));
                    player.body.applyTorque(playerTorque);
                }

                if (keyboardInput.held.KeyA) {
                    playerTorque.scale(deltaTime * PLAYER_SPEED, playerTorque.set(0, 0, 1));
                    player.body.applyTorque(playerTorque);
                }

                if (keyboardInput.held.KeyD) {
                    playerTorque.scale(deltaTime * PLAYER_SPEED, playerTorque.set(0, 0, -1));
                    player.body.applyTorque(playerTorque);
                }

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
