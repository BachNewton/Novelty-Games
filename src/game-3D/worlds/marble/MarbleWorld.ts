import { GameWorldCreator } from "../GameWorld";
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { GameWorldObject, GameWorldObjectCreator } from "../GameWorldObject";
import { randomNum } from "../../../util/Randomizer";
import PlayerTexture from './textures/player.png';
import { Button } from "../../input/XboxController";
import { GenericControllerCreator } from "../../input/GenericController";
import { createPlaygroundGameWorldObjects } from "./PlaygroundLevel";

const PLAYER_SPEED = 0.25;
const WORLD_DOWN = new CANNON.Vec3(0, -1, 0);
const STEEPNESS_THRESHOLD = 0.7;
const JUMP_COOLDOWN = 200;
const CAMERA_ROTATE_SPEED = 0.003;

enum State {
    PLAY, EDIT
}

const MarbleWorld: GameWorldCreator = {
    create: (scene, camera, world, orbitControls) => {
        let state = State.PLAY;

        addLight(scene);

        const gameWorldObjects: GameWorldObject[] = [];

        for (const object of createPlaygroundGameWorldObjects()) {
            scene.add(object.mesh);
            world.addBody(object.body);
            object.update();
        }

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

        orbitControls.target = player.mesh.position;

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
        }, 5000);

        const controller = GenericControllerCreator.create(button => {
            console.log('Button pressed:', button);

            if (button === Button.VIEW) {
                player.body.position.set(0, 2, 0);
                player.body.velocity.setZero();
                player.body.angularVelocity.setZero();
                orbitControls.reset();
            } else if (button === Button.A) {
                if (playerCanJump) {
                    playerCanJump = false;
                    lastJumpTime = performance.now();
                    player.body.velocity.y = 7.5;
                }
            }
        });

        const transformControls = new TransformControls(camera, orbitControls.domElement!);
        transformControls.addEventListener('dragging-changed', e => orbitControls.enabled = !e.value);
        scene.add(transformControls.getHelper());

        const guiPlayMode = new GUI();
        const guiEditMode = new GUI();
        guiEditMode.hide();

        const addBox = () => {
            const tester = GameWorldObjectCreator.create({
                dimensions: {
                    type: 'box',
                    width: 1,
                    height: 1,
                    depth: 1
                },
                material: {
                    type: 'color',
                    color: 'orange'
                },
                mass: 0
            });
            tester.mesh.position.copy(orbitControls.target);
            scene.add(tester.mesh);
            transformControls.attach(tester.mesh);
        };

        const enterEditMode = () => {
            state = State.EDIT;
            orbitControls.target = new THREE.Vector3();
            orbitControls.enablePan = true;
            guiPlayMode.hide();
            guiEditMode.show();
        };
        enterEditMode();

        const enterPlayMode = () => {
            state = State.PLAY;
            orbitControls.target = player.mesh.position;
            orbitControls.enablePan = false;
            guiPlayMode.show();
            guiEditMode.hide();
        };

        guiPlayMode.add({ 'Enter Level Editor': enterEditMode }, 'Enter Level Editor');

        guiEditMode.add({ 'Enter Player Mode': enterPlayMode }, 'Enter Player Mode');
        guiEditMode.add({ 'Add Box': addBox }, 'Add Box');
        guiEditMode.add({ "'W' Translate": () => transformControls.mode = 'translate' }, "'W' Translate");
        guiEditMode.add({ "'E' Rotate": () => transformControls.mode = 'rotate' }, "'E' Rotate");
        guiEditMode.add({ "'R' Scale": () => transformControls.mode = 'scale' }, "'R' Scale");

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

                (orbitControls as any)._rotateLeft(deltaTime * CAMERA_ROTATE_SPEED * controller.rightAxis.x);
                (orbitControls as any)._rotateUp(deltaTime * CAMERA_ROTATE_SPEED * controller.rightAxis.y);
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
