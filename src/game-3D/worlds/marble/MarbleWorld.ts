import { GameWorldCreator } from "../GameWorld";
import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GameWorldObject } from "../GameWorldObject";
import { Button } from "../../input/XboxController";
import { GenericControllerCreator } from "../../input/GenericController";
import { PlayerCreator } from "./Player";
import { MouseInputCreator } from "../../input/Mouse";
import SkyboxPath from './textures/skybox.jpg';
import { Level, loadLevelFile } from "./Level";
import { DEFAULT_COLOR, EditorCreator } from "./Editor";
import Level1 from './levels/level.json';

const CAMERA_ROTATE_SPEED = 0.003;

export enum State {
    PLAY, EDIT
}

const MarbleWorld: GameWorldCreator = {
    create: (scene, camera, world, domElement, updateHUD) => {
        let state = State.PLAY;
        let startTime = performance.now();
        let playerFinished = false;

        addLight(scene);
        addSkybox(scene);

        const controllerDirection = new THREE.Vector3();

        const orbitControls = createOrbitControls(camera, domElement);

        const player = PlayerCreator.create(controllerDirection);
        player.add(scene, world);

        const resetPlayer = (startingPosition: THREE.Vector3) => {
            player.reset(startingPosition, orbitControls);
            startTime = performance.now();
            playerFinished = false;
        };

        const cameraForward = new THREE.Vector3();
        const cameraLeft = new THREE.Vector3();

        // const cameraForwardHelper = new THREE.ArrowHelper(cameraForward, new THREE.Vector3(0, 1, 0));
        // const cameraLeftHelper = new THREE.ArrowHelper(cameraLeft, new THREE.Vector3(0, 1, 0));
        // const controllerDirectionHelper = new THREE.ArrowHelper(cameraLeft, new THREE.Vector3(0, 1.5, 0), 2, 'magenta');
        // scene.add(cameraForwardHelper, cameraLeftHelper, controllerDirectionHelper);

        const editor = EditorCreator.create(scene, camera, orbitControls);

        const guiPlayMode = new GUI({ title: 'Play Mode' });
        const guiEditMode = new GUI({ title: 'Edit Mode' });
        guiEditMode.hide();

        const editableGameWorldObjects: GameWorldObject[] = [];

        const enterEditMode = () => {
            state = State.EDIT;

            guiPlayMode.hide();
            guiEditMode.show();

            for (const editableGameWorldObject of editableGameWorldObjects) {
                scene.remove(editableGameWorldObject.mesh);
                world.removeBody(editableGameWorldObject.body);
            }

            editableGameWorldObjects.splice(0);

            editor.enterEditMode();
        };

        const addEditableObjectsToGameWorld = () => {
            editableGameWorldObjects.splice(0);

            const gameWorldObjects = editor.createGameWorldObjects(() => {
                playerFinished = true;
            });

            for (const object of gameWorldObjects) {
                scene.add(object.mesh);
                world.addBody(object.body);

                editableGameWorldObjects.push(object);
            }
        };

        const enterPlayMode = () => {
            state = State.PLAY;

            resetPlayer(editor.getStartingPosition());

            orbitControls.enablePan = false;

            guiPlayMode.show();
            guiEditMode.hide();

            editor.leaveEditMode();

            addEditableObjectsToGameWorld();
        };

        const loadLevel = (level: Level) => {
            editor.load(level, state);

            if (state === State.PLAY) {
                editableGameWorldObjects.forEach(object => {
                    scene.remove(object.mesh);
                    world.removeBody(object.body);
                });

                addEditableObjectsToGameWorld();

                resetPlayer(editor.getStartingPosition());
            }
        };

        loadLevel(Level1);

        guiPlayMode.add({ "'Tab' Reset": () => resetPlayer(editor.getStartingPosition()) }, "'Tab' Reset");
        const guiPlayModeLevelsFolder = guiPlayMode.addFolder('Levels');
        guiPlayModeLevelsFolder.add({ 'Level 1': () => loadLevel(Level1) }, 'Level 1');
        guiPlayModeLevelsFolder.add({ 'Level 2': () => loadLevel(Level1) }, 'Level 2');
        guiPlayModeLevelsFolder.add({ 'Level 3': () => loadLevel(Level1) }, 'Level 3');
        const guiPlayModeEditorFolder = guiPlayMode.addFolder('Editor');
        guiPlayModeEditorFolder.add({ 'Enter Level Editor': enterEditMode }, 'Enter Level Editor');

        const guiEditModeCreateFolder = guiEditMode.addFolder('Create');
        guiEditModeCreateFolder.add({ 'Add Box': editor.addBox }, 'Add Box');
        guiEditModeCreateFolder.addColor({ 'Color': DEFAULT_COLOR }, 'Color').onChange(color => editor.changeColor(color));
        guiEditModeCreateFolder.add({ 'Delete': editor.delete }, 'Delete');
        guiEditModeCreateFolder.add({ 'Clone': editor.clone }, 'Clone');
        const guiEditModeControlsFolder = guiEditMode.addFolder('Controls');
        guiEditModeControlsFolder.add({ "'Q' Translate": editor.changeToTranslateMode }, "'Q' Translate");
        guiEditModeControlsFolder.add({ "'E' Rotate": editor.changeToRotateMode }, "'E' Rotate");
        guiEditModeControlsFolder.add({ "'R' Scale": editor.changeToScaleMode }, "'R' Scale");
        guiEditModeControlsFolder.add({ "'X' Recenter": editor.recenter }, "'X' Recenter");
        const guiEditModeFileFolder = guiEditMode.addFolder('File');
        guiEditModeFileFolder.add({ 'Save': editor.save }, 'Save');
        guiEditModeFileFolder.add({ 'Load': () => loadLevelFile().then(level => loadLevel(level)) }, 'Load');
        const guiEditModePlayerFolder = guiEditMode.addFolder('Player');
        guiEditModePlayerFolder.add({ 'Enter Play Mode': enterPlayMode }, 'Enter Play Mode');

        const mouseInput = MouseInputCreator.create((pointer) => {
            if (state !== State.EDIT) return;

            editor.onClick(pointer);
        });

        const controller = GenericControllerCreator.create(button => {
            console.log('Button pressed:', button);

            if (button === Button.VIEW) {
                if (state === State.EDIT) return;
                resetPlayer(editor.getStartingPosition())
            } else if (button === Button.A) {
                if (state === State.EDIT) return;
                player.jump();
            } else if (button === Button.RIGHT_STICK_IN) {
                if (state === State.PLAY) return;
                editor.recenter();
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
                    editor.update(deltaTime, controllerDirection, mouseInput.pointer);
                }

                player.update(deltaTime, world.contacts);

                (orbitControls as any)._rotateLeft(deltaTime * CAMERA_ROTATE_SPEED * controller.rightAxis.x);
                (orbitControls as any)._rotateUp(deltaTime * CAMERA_ROTATE_SPEED * controller.rightAxis.y);
                orbitControls.update();

                if (state === State.EDIT) {
                    updateHUD('');
                } else if (state === State.PLAY) {
                    if (!playerFinished) {
                        updateHUD(getHUDText(startTime));
                    }
                }

                // cameraForwardHelper.setDirection(cameraForward);
                // cameraLeftHelper.setDirection(cameraLeft);
                // controllerDirectionHelper.setDirection(controllerDirection);
                // controllerDirectionHelper.setLength(3 * Math.hypot(controller.leftAxis.x, controller.leftAxis.y));
            }
        };
    }
};

function getHUDText(startTime: number): string {
    const stopwatchMs = performance.now() - startTime;
    const stopwtach = stopwatchMs / 1000;

    return stopwtach.toFixed(1).toString();
}

function createOrbitControls(camera: THREE.PerspectiveCamera, rendererDomElement: HTMLCanvasElement): OrbitControls {
    const controls = new OrbitControls(camera, rendererDomElement);

    controls.object.position.set(0, 3, -8);

    controls.minDistance = 4;
    controls.maxDistance = 11;
    controls.enablePan = false;

    controls.update();

    return controls;
}

function addLight(scene: THREE.Scene) {
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.25);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
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

function addSkybox(scene: THREE.Scene) {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(SkyboxPath);

    const skybox = new THREE.Mesh(
        new THREE.SphereGeometry(1000),
        new THREE.MeshStandardMaterial({ map: texture, side: THREE.BackSide })
    );

    scene.add(skybox);
}

export default MarbleWorld;
