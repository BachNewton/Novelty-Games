import { GameWorldCreator } from "../../GameWorld";
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { FunctionController, GUI, NumberController, StringController } from 'three/examples/jsm/libs/lil-gui.module.min';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GameWorldObject } from "../../GameWorldObject";
import { Button } from "../../../input/XboxController";
import { GenericControllerCreator } from "../../../input/GenericController";
import { PlayerCreator } from "./Player";
import { MouseInputCreator } from "../../../input/Mouse";
import SkyboxPath from '../textures/skybox.jpg';
import { Level, LevelMetadata, loadLevelFile } from "./Level";
import { DEFAULT_COLOR, DEFAULT_MATERIAL, EditorCreator } from "./Editor";
import EmptyLevel from '../levels/empty_level.json';
import Level1 from '../levels/level1.json';
import Level2 from '../levels/level2.json';
import Level3 from '../levels/level3.json';
import Level4 from '../levels/level4.json';
import Level5 from '../levels/level5.json';
import Level6 from '../levels/level6.json';
import LevelRainbowRush from '../levels/rainbowRush.json';
import LevelSlalmon from '../levels/slalom.json';
import LevelLoopingCoaster from '../levels/loopingCoaster.json';
import { GameMaterial, gameMaterialToString, stringToGameMaterial } from "./GameMaterial";
import { createSounds } from "./Sounds";
import { clearSummary, createSummary } from "../ui/Summary";

export const temporaryExperimentalProperties = {
    jumpHeight: 7.5,
    slipperiness: 0.99,
    bounciness: 1.05
};

const CAMERA_ROTATE_SPEED = 0.003;

export enum State {
    PLAY, EDIT
}

const MarbleWorld: GameWorldCreator = {
    create: (scene, camera, world, domElement, updateHUD, updateSummary) => {
        let state = State.PLAY;
        let startTime = performance.now();
        let playerFinished = false;

        addLight(scene);
        addSkybox(scene);
        const sounds = createSounds();

        const playerMaterial = new CANNON.Material('player');
        const objectBouncyMaterial = new CANNON.Material('bouncy');
        const objectSlipperyMaterial = new CANNON.Material('slippery');

        const bouncyContactMaterial = new CANNON.ContactMaterial(
            playerMaterial,
            objectBouncyMaterial,
            {
                friction: world.defaultContactMaterial.friction,
                restitution: temporaryExperimentalProperties.bounciness
            }
        );

        const slipperyContactMaterial = new CANNON.ContactMaterial(
            playerMaterial,
            objectSlipperyMaterial,
            {
                friction: 1 - temporaryExperimentalProperties.slipperiness,
                restitution: world.defaultContactMaterial.restitution
            }
        );

        world.addContactMaterial(bouncyContactMaterial);
        world.addContactMaterial(slipperyContactMaterial);

        const controllerDirection = new THREE.Vector3();

        const orbitControls = createOrbitControls(camera, domElement);

        const player = PlayerCreator.create(controllerDirection, playerMaterial);
        player.add(scene, world);

        const resetPlayer = (startingPosition: THREE.Vector3) => {
            collectiblesCollected.forEach(collectible => scene.add(collectible.mesh));
            collectiblesCollected.clear();

            player.reset(startingPosition, orbitControls);
            updateSummary(clearSummary());
            startTime = performance.now();
            playerFinished = false;
        };

        const cameraForward = new THREE.Vector3();
        const cameraLeft = new THREE.Vector3();

        // const cameraForwardHelper = new THREE.ArrowHelper(cameraForward, new THREE.Vector3(0, 1, 0));
        // const cameraLeftHelper = new THREE.ArrowHelper(cameraLeft, new THREE.Vector3(0, 1, 0));
        // const controllerDirectionHelper = new THREE.ArrowHelper(cameraLeft, new THREE.Vector3(0, 1.5, 0), 2, 'magenta');
        // scene.add(cameraForwardHelper, cameraLeftHelper, controllerDirectionHelper);

        const editor = EditorCreator.create(scene, camera, orbitControls, objectBouncyMaterial, objectSlipperyMaterial);

        const guiPlayMode = new GUI({ title: 'Play Mode' });
        const guiEditMode = new GUI({ title: 'Edit Mode' }).hide();

        const editableGameWorldObjects: GameWorldObject[] = [];
        const collectiblesCollected = new Set<GameWorldObject>();
        let totalCollectibles = 0;

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
                if (collectiblesCollected.size !== totalCollectibles) return;
                if (playerFinished) return;

                playerFinished = true;
                sounds.finish.play();
                updateHUD('');
                updateSummary(createSummary({
                    levelName: levelMetadata["Level Name"],
                    yourTime: (performance.now() - startTime) / 1000,
                    bronzeTime: levelMetadata["Bronze Time"],
                    silverTime: levelMetadata["Silver Time"],
                    goldTime: levelMetadata["Gold Time"],
                    diamondTime: levelMetadata["Diamond Time"]
                }));
            }, collectible => {
                if (collectiblesCollected.has(collectible)) return;

                console.log('Collectible collided:', collectible);
                scene.remove(collectible.mesh);
                collectiblesCollected.add(collectible);
                sounds.collect.play();
            }, updatedTotalCollectibles => totalCollectibles = updatedTotalCollectibles);

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

        const levelMetadata: LevelMetadata = {
            'Level Name': 'level',
            'Bronze Time': -1,
            'Silver Time': -1,
            'Gold Time': -1,
            'Diamond Time': -1
        };

        const levelMetadataControllers = {
            name: null as StringController<LevelMetadata, 'Level Name'> | null,
            bronzeTime: null as NumberController<LevelMetadata, 'Bronze Time'> | null,
            silverTime: null as NumberController<LevelMetadata, 'Silver Time'> | null,
            goldTime: null as NumberController<LevelMetadata, 'Gold Time'> | null,
            diamondTime: null as NumberController<LevelMetadata, 'Diamond Time'> | null,
        };

        const transformSpaceControllers = {
            local: null as FunctionController<{ "'F' Switch to Local Space": () => void }, "'F' Switch to Local Space"> | null,
            world: null as FunctionController<{ "'F' Switch to World Space": () => void }, "'F' Switch to World Space"> | null
        };

        const loadLevel = (level: Level) => {
            collectiblesCollected.clear();

            levelMetadataControllers.name?.setValue(level.metadata['Level Name']);
            levelMetadataControllers.bronzeTime?.setValue(level.metadata['Bronze Time']);
            levelMetadataControllers.silverTime?.setValue(level.metadata['Silver Time']);
            levelMetadataControllers.goldTime?.setValue(level.metadata['Gold Time']);
            levelMetadataControllers.diamondTime?.setValue(level.metadata['Diamond Time']);

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

        const switchToLocalSpace = () => {
            editor.setToLocalSpace();
            transformSpaceControllers.local?.hide();
            transformSpaceControllers.world?.show();
        };

        const switchToWorldSpace = () => {
            editor.setToWorldSpace();
            transformSpaceControllers.world?.hide();
            transformSpaceControllers.local?.show();
        };

        guiPlayMode.add({ "'Tab' Reset": () => resetPlayer(editor.getStartingPosition()) }, "'Tab' Reset");
        const guiPlayModeLevelsFolder = guiPlayMode.addFolder('Levels');
        guiPlayModeLevelsFolder.add({ 'Level 1': () => loadLevel(Level1) }, 'Level 1');
        guiPlayModeLevelsFolder.add({ 'Level 2': () => loadLevel(Level2) }, 'Level 2');
        guiPlayModeLevelsFolder.add({ 'Level 3': () => loadLevel(Level3) }, 'Level 3');
        guiPlayModeLevelsFolder.add({ 'Level 4': () => loadLevel(Level4) }, 'Level 4');
        guiPlayModeLevelsFolder.add({ 'Level 5': () => loadLevel(Level5) }, 'Level 5');
        guiPlayModeLevelsFolder.add({ 'Level 6': () => loadLevel(Level6) }, 'Level 6');
        guiPlayModeLevelsFolder.add({ 'Rainbow Rush': () => loadLevel(LevelRainbowRush) }, 'Rainbow Rush');
        guiPlayModeLevelsFolder.add({ 'Slalom Madness': () => loadLevel(LevelSlalmon) }, 'Slalom Madness');
        guiPlayModeLevelsFolder.add({ 'Looping Coaster 1': () => loadLevel(LevelLoopingCoaster) }, 'Looping Coaster 1');
        const guiPlayModeEditorFolder = guiPlayMode.addFolder('Editor');
        guiPlayModeEditorFolder.add({ 'Enter Level Editor': enterEditMode }, 'Enter Level Editor');
        const guiPlayModeExperimentalFolder = guiPlayMode.addFolder('Experimental');
        guiPlayModeExperimentalFolder.add(temporaryExperimentalProperties, 'jumpHeight', 0, 10);
        guiPlayModeExperimentalFolder.add(temporaryExperimentalProperties, 'slipperiness', 0, 1).onChange(slipperiness => slipperyContactMaterial.friction = 1 - slipperiness);
        guiPlayModeExperimentalFolder.add(temporaryExperimentalProperties, 'bounciness', 0, 2).onChange(bounciness => bouncyContactMaterial.restitution = bounciness);
        guiPlayModeExperimentalFolder.close();

        const guiEditModeCreateFolder = guiEditMode.addFolder('Create');
        guiEditModeCreateFolder.add({ 'Add Box': editor.addBox }, 'Add Box');
        guiEditModeCreateFolder.addColor({ 'Color': DEFAULT_COLOR }, 'Color').onChange(color => editor.changeColor(color));
        guiEditModeCreateFolder.add(
            { 'Material': gameMaterialToString(DEFAULT_MATERIAL) },
            'Material',
            [gameMaterialToString(GameMaterial.NORMAL), gameMaterialToString(GameMaterial.SLIPPERY), gameMaterialToString(GameMaterial.BOUNCY)]
        ).onChange(material => editor.changeMaterial(stringToGameMaterial(material)));
        guiEditModeCreateFolder.add({ 'Add Collectible': editor.addCollectible }, 'Add Collectible');
        guiEditModeCreateFolder.add({ "'Backspace' Delete": editor.delete }, "'Backspace' Delete");
        guiEditModeCreateFolder.add({ "'C' Clone": editor.clone }, "'C' Clone");
        const guiEditModeControlsFolder = guiEditMode.addFolder('Controls');
        guiEditModeControlsFolder.add({ "'Q' Translate": editor.changeToTranslateMode }, "'Q' Translate");
        guiEditModeControlsFolder.add({ "'E' Rotate": editor.changeToRotateMode }, "'E' Rotate");
        guiEditModeControlsFolder.add({ "'R' Scale": editor.changeToScaleMode }, "'R' Scale");
        guiEditModeControlsFolder.add({ "'X' Recenter": editor.recenter }, "'X' Recenter");
        transformSpaceControllers.local = guiEditModeControlsFolder.add({ "'F' Switch to Local Space": switchToLocalSpace }, "'F' Switch to Local Space");
        transformSpaceControllers.world = guiEditModeControlsFolder.add({ "'F' Switch to World Space": switchToWorldSpace }, "'F' Switch to World Space").hide();
        const guiEditMetadataFolder = guiEditMode.addFolder('Metadata');
        levelMetadataControllers.name = guiEditMetadataFolder.add(levelMetadata, 'Level Name');
        levelMetadataControllers.bronzeTime = guiEditMetadataFolder.add(levelMetadata, 'Bronze Time', 0, undefined, undefined);
        levelMetadataControllers.silverTime = guiEditMetadataFolder.add(levelMetadata, 'Silver Time', 0, undefined, undefined);
        levelMetadataControllers.goldTime = guiEditMetadataFolder.add(levelMetadata, 'Gold Time', 0, undefined, undefined);
        levelMetadataControllers.diamondTime = guiEditMetadataFolder.add(levelMetadata, 'Diamond Time', 0, undefined, undefined);
        const guiEditModeFileFolder = guiEditMode.addFolder('File');
        guiEditModeFileFolder.add({ 'Save': () => editor.save(levelMetadata) }, 'Save');
        guiEditModeFileFolder.add({ 'Load': () => loadLevelFile().then(level => loadLevel(level)) }, 'Load');
        guiEditModeFileFolder.add({ 'Empty Level': () => { if (window.confirm('Are you sure you want to empty the level?\nThis will erase all your progress!')) loadLevel(EmptyLevel) } }, 'Empty Level');
        const guiEditModePlayerFolder = guiEditMode.addFolder('Player');
        guiEditModePlayerFolder.add({ 'Enter Play Mode': enterPlayMode }, 'Enter Play Mode');

        loadLevel(Level1);

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
                        editableGameWorldObject.update(deltaTime);
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
                        updateHUD(getHUDText(startTime, collectiblesCollected.size, totalCollectibles));
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

function getHUDText(startTime: number, collectiblesCollected: number, totalCollectibles: number): string {
    const stopwatchMs = performance.now() - startTime;
    const stopwtach = stopwatchMs / 1000;

    const collectibleText = totalCollectibles === 0 ? '' : ` - (${collectiblesCollected}/${totalCollectibles})`;

    return stopwtach.toFixed(1).toString() + collectibleText;
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
