import { GameWorldCreator } from "../GameWorld";
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GameWorldObject } from "../GameWorldObject";
import { Button } from "../../input/XboxController";
import { GenericControllerCreator } from "../../input/GenericController";
import { PlayerCreator } from "./Player";
import { MouseInputCreator } from "../../input/Mouse";
import SkyboxPath from './textures/skybox.jpg';
import { Level, loadLevelFile } from "./Level";
import { DEFAULT_COLOR, DEFAULT_MATERIAL, EditorCreator } from "./Editor";
import EmptyLevel from './levels/empty_level.json';
import Level1 from './levels/level1.json';
import Level2 from './levels/level2.json';
import Level3 from './levels/level3.json';
import { GameMaterial, gameMaterialToString, stringToGameMaterial } from "./GameMaterial";

export const temporaryExperimentalProperties = {
    jumpHeight: 7.5,
    slipperiness: 0.3,
    bounciness: 0
};

export const temporaryPlayerMaterial = new CANNON.Material('player');
export const temporaryObjectMaterial = new CANNON.Material('object');
const temporaryContactMaterial = new CANNON.ContactMaterial(
    temporaryPlayerMaterial,
    temporaryObjectMaterial,
    {
        friction: temporaryExperimentalProperties.slipperiness,
        restitution: temporaryExperimentalProperties.bounciness
    }
);

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

        world.addContactMaterial(temporaryContactMaterial);

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
        guiPlayModeLevelsFolder.add({ 'Level 2': () => loadLevel(Level2) }, 'Level 2');
        guiPlayModeLevelsFolder.add({ 'Level 3': () => loadLevel(Level3) }, 'Level 3');
        const guiPlayModeEditorFolder = guiPlayMode.addFolder('Editor');
        guiPlayModeEditorFolder.add({ 'Enter Level Editor': enterEditMode }, 'Enter Level Editor');
        const guiPlayModeExperimentalFolder = guiPlayMode.addFolder('Experimental');
        guiPlayModeExperimentalFolder.add(temporaryExperimentalProperties, 'jumpHeight', 0, 10);
        guiPlayModeExperimentalFolder.add(temporaryExperimentalProperties, 'slipperiness', 0, 1).onChange(slipperiness => temporaryContactMaterial.friction = 1 - slipperiness);
        guiPlayModeExperimentalFolder.add(temporaryExperimentalProperties, 'bounciness', 0, 2).onChange(bounciness => temporaryContactMaterial.restitution = bounciness);
        guiPlayModeExperimentalFolder.close();

        const guiEditModeCreateFolder = guiEditMode.addFolder('Create');
        guiEditModeCreateFolder.add({ 'Add Box': editor.addBox }, 'Add Box');
        guiEditModeCreateFolder.addColor({ 'Color': DEFAULT_COLOR }, 'Color').onChange(color => editor.changeColor(color));
        guiEditModeCreateFolder.add(
            { 'Material': gameMaterialToString(DEFAULT_MATERIAL) },
            'Material',
            [gameMaterialToString(GameMaterial.NORMAL), gameMaterialToString(GameMaterial.SLIPPERY), gameMaterialToString(GameMaterial.BOUNCY)]
        ).onChange(material => editor.changeMaterial(stringToGameMaterial(material)));
        guiEditModeCreateFolder.add({ "'Backspace' Delete": editor.delete }, "'Backspace' Delete");
        guiEditModeCreateFolder.add({ "'C' Clone": editor.clone }, "'C' Clone");
        const guiEditModeControlsFolder = guiEditMode.addFolder('Controls');
        guiEditModeControlsFolder.add({ "'Q' Translate": editor.changeToTranslateMode }, "'Q' Translate");
        guiEditModeControlsFolder.add({ "'E' Rotate": editor.changeToRotateMode }, "'E' Rotate");
        guiEditModeControlsFolder.add({ "'R' Scale": editor.changeToScaleMode }, "'R' Scale");
        guiEditModeControlsFolder.add({ "'X' Recenter": editor.recenter }, "'X' Recenter");
        const guiEditModeFileFolder = guiEditMode.addFolder('File');
        guiEditModeFileFolder.add({ 'Save': editor.save }, 'Save');
        guiEditModeFileFolder.add({ 'Load': () => loadLevelFile().then(level => loadLevel(level)) }, 'Load');
        guiEditModeFileFolder.add({ 'Empty Level': () => { if (window.confirm('Are you sure you want to empty the level?\nThis will erase all your progress!')) loadLevel(EmptyLevel) } }, 'Empty Level');
        const guiEditModePlayerFolder = guiEditMode.addFolder('Player');
        guiEditModePlayerFolder.add({ 'Enter Play Mode': enterPlayMode }, 'Enter Play Mode');

        const mouseInput = MouseInputCreator.create((pointer, target) => {
            if (state !== State.EDIT) return;
            if (domElement !== target) return;

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
            } else if (button === Button.LEFT_D_STICK) {
                if (state === State.PLAY) return;
                editor.delete();
            } else if (button === Button.RIGHT_D_STICK) {
                if (state === State.PLAY) return;
                editor.clone();
            } else if (button === Button.X) {
                if (state === State.PLAY) return;
                editor.changeToTranslateMode();
            } else if (button === Button.Y) {
                if (state === State.PLAY) return;
                editor.changeToRotateMode();
            } else if (button === Button.B) {
                if (state === State.PLAY) return;
                editor.changeToScaleMode();
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
                } else if (state === State.PLAY) {
                    for (const editableGameWorldObject of editableGameWorldObjects) {
                        editableGameWorldObject.update();
                    }
                }

                player.update(deltaTime, world.contacts, controller.pressed.a);

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

    controls.saveState();

    controls.update();

    return controls;
}

function addLight(scene: THREE.Scene) {
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.2);
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
    const texture = loader.load(SkyboxPath, data => {
        data.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = data;
    });

    const skybox = new THREE.Mesh(
        new THREE.SphereGeometry(1000),
        new THREE.MeshStandardMaterial({ map: texture, side: THREE.BackSide })
    );

    scene.add(skybox);
}

export default MarbleWorld;
