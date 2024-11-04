import { GameWorldCreator } from "../GameWorld";
import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { GameWorldObject } from "../GameWorldObject";
import { Button } from "../../input/XboxController";
import { GenericControllerCreator } from "../../input/GenericController";
import { PlayerCreator } from "./Player";
import { MouseInputCreator } from "../../input/Mouse";
import SkyboxPath from './textures/skybox.jpg';
import { loadLevel } from "./Level";
import { EditorCreator } from "./Editor";

const CAMERA_ROTATE_SPEED = 0.003;

enum State {
    PLAY, EDIT
}

const MarbleWorld: GameWorldCreator = {
    create: (scene, camera, world, orbitControls) => {
        let state = State.PLAY;

        addLight(scene);
        addSkybox(scene);

        const controllerDirection = new THREE.Vector3();

        const player = PlayerCreator.create(controllerDirection);
        player.add(scene, world);
        player.reset(new THREE.Vector3(), orbitControls);

        const cameraForward = new THREE.Vector3();
        const cameraLeft = new THREE.Vector3();

        // const cameraForwardHelper = new THREE.ArrowHelper(cameraForward, new THREE.Vector3(0, 1, 0));
        // const cameraLeftHelper = new THREE.ArrowHelper(cameraLeft, new THREE.Vector3(0, 1, 0));
        // const controllerDirectionHelper = new THREE.ArrowHelper(cameraLeft, new THREE.Vector3(0, 1.5, 0), 2, 'magenta');
        // scene.add(cameraForwardHelper, cameraLeftHelper, controllerDirectionHelper);

        const editor = EditorCreator.create(scene, camera, orbitControls);

        const guiPlayMode = new GUI();
        const guiEditMode = new GUI();
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

            for (const object of editor.createGameWorldObjects()) {
                scene.add(object.mesh);
                world.addBody(object.body);

                editableGameWorldObjects.push(object);
            }
        };

        const enterPlayMode = () => {
            state = State.PLAY;

            player.reset(editor.getStartingPosition(), orbitControls);

            orbitControls.enablePan = false;

            guiPlayMode.show();
            guiEditMode.hide();

            editor.leaveEditMode();

            addEditableObjectsToGameWorld();
        };

        const loadLevel1 = () => {
            const level = loadLevel();

            editor.loadLevel(level);

            if (state === State.PLAY) {
                addEditableObjectsToGameWorld();
                player.reset(editor.getStartingPosition(), orbitControls);
            }
        };

        loadLevel1();

        guiPlayMode.add({ 'Enter Level Editor': enterEditMode }, 'Enter Level Editor');
        guiPlayMode.add({ 'Level 1': loadLevel1 }, 'Level 1');
        guiEditMode.add({ 'Enter Play Mode': enterPlayMode }, 'Enter Play Mode');
        guiEditMode.add({ 'Add Box': editor.addBox }, 'Add Box');
        guiEditMode.addColor({ 'Color': 0xFFA500 }, 'Color').onChange(color => editor.changeColor(color));
        guiEditMode.add({ "'Q' Translate": () => editor.changeToTranslateMode }, "'Q' Translate");
        guiEditMode.add({ "'E' Rotate": () => editor.changeToRotateMode }, "'E' Rotate");
        guiEditMode.add({ "'R' Scale": () => editor.changeToScaleMode }, "'R' Scale");
        guiEditMode.add({ "'X' Recenter": editor.recenter }, "'X' Recenter");
        guiEditMode.add({ 'Save': editor.save }, 'Save');

        const mouseInput = MouseInputCreator.create((pointer) => {
            if (state !== State.EDIT) return;

            editor.onClick(pointer);
        });

        const controller = GenericControllerCreator.create(button => {
            console.log('Button pressed:', button);

            if (button === Button.VIEW) {
                if (state === State.EDIT) return;
                player.reset(editor.getStartingPosition(), orbitControls);
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

                // cameraForwardHelper.setDirection(cameraForward);
                // cameraLeftHelper.setDirection(cameraLeft);
                // controllerDirectionHelper.setDirection(controllerDirection);
                // controllerDirectionHelper.setLength(3 * Math.hypot(controller.leftAxis.x, controller.leftAxis.y));
            }
        };
    }
};

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
