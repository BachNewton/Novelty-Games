import { GameWorldCreator } from "../GameWorld";
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { GameWorldObject, GameWorldObjectCreator } from "../GameWorldObject";
import { randomNum } from "../../../util/Randomizer";
import { Button } from "../../input/XboxController";
import { GenericControllerCreator } from "../../input/GenericController";
import { createPlaygroundGameWorldObjects } from "./PlaygroundLevel";
import { PlayerCreator } from "./Player";

const CAMERA_ROTATE_SPEED = 0.003;
const CAMERA_EDIT_SPEED = 0.02;

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

        const controllerDirection = new THREE.Vector3();

        const player = PlayerCreator.create(controllerDirection);
        player.add(scene, world);
        player.updateOrbitControls(orbitControls);

        const cameraForward = new THREE.Vector3();
        const cameraLeft = new THREE.Vector3();

        const cameraForwardHelper = new THREE.ArrowHelper(cameraForward, new THREE.Vector3(0, 2, 0));
        const cameraLeftHelper = new THREE.ArrowHelper(cameraLeft, new THREE.Vector3(0, 2, 0));
        const controllerDirectionHelper = new THREE.ArrowHelper(cameraLeft, new THREE.Vector3(0, 2.5, 0), 2, 'magenta');
        scene.add(cameraForwardHelper, cameraLeftHelper, controllerDirectionHelper);

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
                player.reset(orbitControls);
            } else if (button === Button.A) {
                player.jump();
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
            player.updateOrbitControls(orbitControls);
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

                controllerDirection.set(0, 0, 0);
                controllerDirection.addScaledVector(cameraForward, -controller.leftAxis.y);
                controllerDirection.addScaledVector(cameraLeft, -controller.leftAxis.x);

                if (state === State.EDIT) {
                    const panOffset = (orbitControls as any)._panOffset as THREE.Vector3;
                    panOffset.addScaledVector(controllerDirection, deltaTime * CAMERA_EDIT_SPEED);
                }

                for (const gameWorldObject of gameWorldObjects) {
                    gameWorldObject.update();
                }

                player.update(deltaTime, world.contacts);

                (orbitControls as any)._rotateLeft(deltaTime * CAMERA_ROTATE_SPEED * controller.rightAxis.x);
                (orbitControls as any)._rotateUp(deltaTime * CAMERA_ROTATE_SPEED * controller.rightAxis.y);
                orbitControls.update();

                cameraForwardHelper.setDirection(cameraForward);
                cameraLeftHelper.setDirection(cameraLeft);
                controllerDirectionHelper.setDirection(controllerDirection);
                controllerDirectionHelper.setLength(3 * Math.hypot(controller.leftAxis.x, controller.leftAxis.y));
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
