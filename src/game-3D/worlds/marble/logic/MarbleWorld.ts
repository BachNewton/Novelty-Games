import { GameWorld, GameWorldCreator } from "../../GameWorld";
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GameWorldObject } from "../../GameWorldObject";
import { Button } from "../../../input/XboxController";
import { GenericControllerCreator } from "../../../input/GenericController";
import { PlayerCreator } from "./Player";
import { MouseInputCreator } from "../../../input/Mouse";
import SkyboxPath from '../textures/skybox.jpg';
import { Level } from "./Level";
import { EditorCreator } from "./Editor";
import Level1 from '../levels/level1.json';
import { createSounds } from "./Sounds";
import { clearSummary, createSummary } from "../ui/Summary";
import { marbleWorldGuiCreator } from "./MarbleWorldGui";

export const temporaryExperimentalProperties = {
    jumpHeight: 7.5,
    slipperiness: 0.99,
    bounciness: 1.05
};

const CAMERA_ROTATE_SPEED = 0.003;
const AUTOSAVE_FREQUENCY = 45000; // 45 seconds

export enum State {
    PLAY, EDIT
}

const MarbleWorld: GameWorldCreator = {
    create: (scene, camera, world, domElement, updateHUD, updateSummary) => createMarbleWorld(scene, camera, world, domElement, updateHUD, updateSummary)
};

function createMarbleWorld(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    world: CANNON.World,
    domElement: HTMLCanvasElement,
    updateHUD: (text: string) => void,
    updateSummary: (element: JSX.Element) => void
): GameWorld {
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

    let lastAutosave = performance.now();

    const editableGameWorldObjects: GameWorldObject[] = [];
    const collectiblesCollected = new Set<GameWorldObject>();
    let totalCollectibles = 0;

    const enterEditMode = () => {
        state = State.EDIT;

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
            const levelMetadata = gui.getLevelMetadata();
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

        editor.leaveEditMode();

        addEditableObjectsToGameWorld();
    };

    const loadLevel = (level: Level) => {
        collectiblesCollected.clear();

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

    const gui = marbleWorldGuiCreator.create(
        editor,
        {
            onResetPlayer: () => resetPlayer(editor.getStartingPosition()),
            onLoadLevel: (level) => loadLevel(level),
            onEnterEditMode: () => enterEditMode(),
            onEnterPlayMode: () => enterPlayMode()
        }
    );

    const mouseInput = MouseInputCreator.create((pointer, target) => {
        if (state !== State.EDIT) return;
        if (domElement !== target) return;

        editor.onClick(pointer);
    });

    const controller = GenericControllerCreator.create(button => {
        console.log('Button pressed:', button);

        if (button === Button.VIEW) {
            if (state === State.EDIT) {
                gui.quicksave();
            } else if (state === State.PLAY) {
                resetPlayer(editor.getStartingPosition());
            }
        } else if (button === Button.A) {
            if (state === State.EDIT) return;
            player.jump();
        } else if (button === Button.LEFT_STICK_IN) {
            if (state === State.PLAY) return;
            gui.toggleEditorSpace();
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

    loadLevel(Level1);

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

            if (state === State.EDIT && performance.now() - lastAutosave > AUTOSAVE_FREQUENCY) {
                gui.autosave();
                lastAutosave = performance.now();
            }

            // cameraForwardHelper.setDirection(cameraForward);
            // cameraLeftHelper.setDirection(cameraLeft);
            // controllerDirectionHelper.setDirection(controllerDirection);
            // controllerDirectionHelper.setLength(3 * Math.hypot(controller.leftAxis.x, controller.leftAxis.y));
        }
    };
}

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
