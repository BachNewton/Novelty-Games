import { GameWorldCreator } from "../GameWorld";
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GameWorldObject, GameWorldObjectCreator } from "../GameWorldObject";
import { randomNum } from "../../../util/Randomizer";
import PlayerTexture from './textures/player.png';
import { Button } from "../../input/XboxController";
import { GenericControllerCreator } from "../../input/GenericController";

const PLAYER_SPEED = 0.25;
const WORLD_DOWN = new CANNON.Vec3(0, -1, 0);
const STEEPNESS_THRESHOLD = 0.7;
const JUMP_COOLDOWN = 200;

const MarbleWorld: GameWorldCreator = {
    create: (scene, camera, world, orbitControls) => {
        addLight(scene);

        const gameWorldObjects: GameWorldObject[] = [];

        const floor = GameWorldObjectCreator.create({
            dimensions: {
                type: 'box',
                width: 20,
                height: 1,
                depth: 20
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

        const ramp = GameWorldObjectCreator.create({
            dimensions: {
                type: 'box',
                width: 5,
                height: 0.5,
                depth: 5
            },
            material: {
                type: 'color',
                color: 'lightgreen'
            },
            mass: 0
        });
        ramp.body.position.set(0, 3, -7);
        ramp.body.quaternion.setFromEuler(Math.PI / 4, 0, 0);

        scene.add(ramp.mesh);
        world.addBody(ramp.body);
        gameWorldObjects.push(ramp);

        const steepRamp = GameWorldObjectCreator.create({
            dimensions: {
                type: 'box',
                width: 5,
                height: 0.5,
                depth: 5
            },
            material: {
                type: 'color',
                color: 'pink'
            },
            mass: 0
        });
        steepRamp.body.position.set(-7, 3, 0);
        steepRamp.body.quaternion.setFromEuler(0, 0, -Math.PI / 3);

        scene.add(steepRamp.mesh);
        world.addBody(steepRamp.body);
        gameWorldObjects.push(steepRamp);

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

        let playerCanJump = false;
        let lastJumpTime = 0;
        player.body.position.y = 2;
        const playerBodyIntendedDirection = new CANNON.Vec3();
        const playerTorque = new CANNON.Vec3();

        const cameraForward = new THREE.Vector3();
        const cameraLeft = new THREE.Vector3();
        const playerIntendedDirection = new THREE.Vector3();

        const cameraForwardHelper = new THREE.ArrowHelper(cameraForward, new THREE.Vector3(0, 2, 0));
        const cameraLeftHelper = new THREE.ArrowHelper(cameraLeft, new THREE.Vector3(0, 2, 0));
        const playerIntendedDirectionHelper = new THREE.ArrowHelper(cameraLeft, new THREE.Vector3(0, 2.5, 0), 2, 'magenta');
        scene.add(cameraForwardHelper, cameraLeftHelper, playerIntendedDirectionHelper);

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

        }, 4000);

        const controller = GenericControllerCreator.create(button => {
            console.log('Button pressed:', button);

            if (button === Button.VIEW) {
                player.body.position.set(0, 2, 0);
                player.body.velocity.setZero();
                player.body.angularVelocity.setZero();
            } else if (button === Button.A) {
                if (playerCanJump) {
                    playerCanJump = false;
                    lastJumpTime = performance.now();
                    player.body.velocity.y = 7.5;
                }
            }
        });

        return {
            update: (deltaTime) => {
                controller.update();

                camera.getWorldDirection(cameraForward);
                cameraForward.setY(0).normalize();
                cameraLeft.crossVectors(camera.up, cameraForward);

                playerIntendedDirection.set(0, 0, 0);
                playerIntendedDirection.addScaledVector(cameraForward, -controller.leftAxis.y);
                playerIntendedDirection.addScaledVector(cameraLeft, -controller.leftAxis.x);

                playerBodyIntendedDirection.set(playerIntendedDirection.x, 0, playerIntendedDirection.z);
                playerBodyIntendedDirection.cross(world.gravity, playerTorque);
                playerTorque.scale(deltaTime * PLAYER_SPEED);
                player.body.applyTorque(playerTorque);

                cameraForwardHelper.setDirection(cameraForward);
                cameraLeftHelper.setDirection(cameraLeft);
                playerIntendedDirectionHelper.setDirection(playerIntendedDirection);
                playerIntendedDirectionHelper.setLength(3 * Math.hypot(controller.leftAxis.x, controller.leftAxis.y));

                for (const gameWorldObject of gameWorldObjects) {
                    gameWorldObject.update();
                }

                for (const contact of world.contacts) {
                    if (contact.bi.id === player.body.id) {
                        const steepness = contact.ni.dot(WORLD_DOWN);
                        playerCanJump = steepness > STEEPNESS_THRESHOLD && performance.now() - lastJumpTime > JUMP_COOLDOWN;
                    }
                }

                orbitControls.target = player.mesh.position;
                orbitControls.update();
            }
        };
    }
};

function addLight(scene: THREE.Scene) {
    const ambientLight = new THREE.AmbientLight();

    const directionalLight = new THREE.DirectionalLight();
    directionalLight.castShadow = true;
    const size = 25;
    directionalLight.position.set(size, size, size);
    directionalLight.shadow.camera.left = -size;
    directionalLight.shadow.camera.right = size;
    directionalLight.shadow.camera.top = size;
    directionalLight.shadow.camera.bottom = -size;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;

    scene.add(ambientLight);
    scene.add(directionalLight);

    // scene.add(new THREE.DirectionalLightHelper(directionalLight));
    // scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));
}

export default MarbleWorld;
