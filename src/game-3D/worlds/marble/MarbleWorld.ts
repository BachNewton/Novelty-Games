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
import { MouseInput, MouseInputCreator, Pointer } from "../../input/Mouse";

const CAMERA_ROTATE_SPEED = 0.003;
const CAMERA_EDIT_SPEED = 0.02;

enum State {
    PLAY, EDIT
}

const MarbleWorld: GameWorldCreator = {
    create: (scene, camera, world, orbitControls) => {
        let state = State.PLAY;

        addLight(scene);

        const balls: GameWorldObject[] = [];

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
            balls.push(ball);
        }, 5000);

        const transformControls = new TransformControls(camera, orbitControls.domElement!);
        transformControls.addEventListener('dragging-changed', e => orbitControls.enabled = !e.value);
        scene.add(transformControls.getHelper());

        const guiPlayMode = new GUI();
        const guiEditMode = new GUI();
        guiEditMode.hide();

        const editableObjects: THREE.Mesh[] = [];
        const editableGameWorldObjects: GameWorldObject[] = [];
        const addBox = () => {
            const editableObject = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshStandardMaterial({ color: 'orange' })
            );

            editableObject.castShadow = true;
            editableObject.receiveShadow = true;

            editableObject.position.copy(orbitControls.target);

            scene.add(editableObject);

            transformControls.attach(editableObject);

            editableObjects.push(editableObject);
        };

        const enterEditMode = () => {
            state = State.EDIT;
            orbitControls.target = new THREE.Vector3();
            orbitControls.enablePan = true;
            guiPlayMode.hide();
            guiEditMode.show();

            for (const editableGameWorldObject of editableGameWorldObjects) {
                scene.remove(editableGameWorldObject.mesh);
                world.removeBody(editableGameWorldObject.body);
            }

            for (const editableObject of editableObjects) {
                scene.add(editableObject);
            }
        };
        enterEditMode();

        const enterPlayMode = () => {
            state = State.PLAY;
            player.updateOrbitControls(orbitControls);
            orbitControls.enablePan = false;
            guiPlayMode.show();
            guiEditMode.hide();
            transformControls.detach();

            for (const editableObject of editableObjects) {
                scene.remove(editableObject);

                const object = GameWorldObjectCreator.create({
                    dimensions: {
                        type: 'box',
                        width: editableObject.scale.x,
                        height: editableObject.scale.y,
                        depth: editableObject.scale.z
                    },
                    material: {
                        type: 'color',
                        color: 'orange'
                    },
                    mass: 0
                });

                object.body.position.set(
                    editableObject.position.x,
                    editableObject.position.y,
                    editableObject.position.z
                );

                object.body.quaternion.set(
                    editableObject.quaternion.x,
                    editableObject.quaternion.y,
                    editableObject.quaternion.z,
                    editableObject.quaternion.w
                );

                object.update();

                scene.add(object.mesh);
                world.addBody(object.body);

                editableGameWorldObjects.push(object);
            }
        };

        const recenter = () => {
            if (state !== State.EDIT) return;
            if (transformControls.object === undefined) return;
            orbitControls.target.copy(transformControls.object.position);
        };

        guiPlayMode.add({ 'Enter Level Editor': enterEditMode }, 'Enter Level Editor');

        guiEditMode.add({ 'Enter Player Mode': enterPlayMode }, 'Enter Player Mode');
        guiEditMode.add({ 'Add Box': addBox }, 'Add Box');
        guiEditMode.add({ "'Q' Translate": () => transformControls.mode = 'translate' }, "'Q' Translate");
        guiEditMode.add({ "'E' Rotate": () => transformControls.mode = 'rotate' }, "'E' Rotate");
        guiEditMode.add({ "'R' Scale": () => transformControls.mode = 'scale' }, "'R' Scale");
        guiEditMode.add({ "'X' Recenter": recenter }, "'X' Recenter");

        const raycaster = new THREE.Raycaster();
        const mouseCoordinates = new THREE.Vector2();

        const mouseInput = MouseInputCreator.create((pointer) => {
            if (state !== State.EDIT) return;
            if (transformControls.dragging) return;
            const object = findObjectUnderPointer(pointer, mouseCoordinates, raycaster, camera, editableObjects);
            if (object === null) return;
            transformControls.attach(object);
        });

        const controller = GenericControllerCreator.create(button => {
            console.log('Button pressed:', button);

            if (button === Button.VIEW) {
                player.reset(orbitControls);
            } else if (button === Button.A) {
                player.jump();
            } else if (button === Button.RIGHT_STICK_IN) {
                recenter();
            }
        });

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

                    for (const editableObject of editableObjects) {
                        const material = editableObject.material as THREE.MeshStandardMaterial;
                        material.emissive.setHex(0x000000);
                    }

                    const object = findObjectUnderPointer(mouseInput.pointer, mouseCoordinates, raycaster, camera, editableObjects);
                    if (object !== null && object !== transformControls.object) {
                        const material = object.material as THREE.MeshStandardMaterial;
                        material.emissive.setColorName('yellow');
                    }
                }

                for (const ball of balls) {
                    ball.update();
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

function findObjectUnderPointer(
    pointer: Pointer,
    mouseCoordinates: THREE.Vector2,
    raycaster: THREE.Raycaster,
    camera: THREE.Camera,
    objects: THREE.Mesh[]
): THREE.Mesh | null {
    mouseCoordinates.x = (pointer.x / window.innerWidth) * 2 - 1;
    mouseCoordinates.y = - (pointer.y / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouseCoordinates, camera);
    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length === 0) return null;

    return intersects[0].object as THREE.Mesh;
}

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
