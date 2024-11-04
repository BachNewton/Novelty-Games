import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GameWorldObject, GameWorldObjectCreator } from '../GameWorldObject';
import PlayerTexture from './textures/player.png';
import CheckeredTexture from './textures/checkered.jpg';
import { createLevel, Level, Obstacle, createLevelFile } from './Level';
import { Pointer } from '../../input/Mouse';

const CAMERA_EDIT_SPEED = 0.02;

interface Editor {
    enterEditMode: () => void;
    leaveEditMode: () => void;
    createGameWorldObjects(): GameWorldObject[];
    getStartingPosition: () => THREE.Vector3;
    recenter: () => void;
    loadLevel: (level: Level) => void;
    addBox: () => void;
    changeColor: (color: number) => void;
    changeToTranslateMode: () => void;
    changeToRotateMode: () => void;
    changeToScaleMode: () => void;
    save: () => void;
    onClick: (pointer: Pointer) => void;
    update: (deltaTime: number, controllerDirection: THREE.Vector3, mousePointer: Pointer) => void;
}

interface EditorCreator {
    create: (
        scene: THREE.Scene,
        camera: THREE.Camera,
        orbitControls: OrbitControls
    ) => Editor;
}

export const EditorCreator: EditorCreator = {
    create: (scene, camera, orbitControls) => createEditor(scene, camera, orbitControls)
};

function createEditor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    orbitControls: OrbitControls
): Editor {
    const transformControls = createTransformControls(scene, camera, orbitControls);
    const editableStartingObject = createEditableStartingObject();
    const editableFinishingObject = createEditableFinishingObject();
    const editableObjects: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[] = [];
    let editableObjectColor = 0xFFA500;
    const raycaster = new THREE.Raycaster();
    const mouseCoordinates = new THREE.Vector2();

    const forceIntoTranslateMode = () => transformControls.mode = 'translate';

    const addBox = () => {
        const editableObject = createEditableObject(editableObjectColor);

        editableObject.position.copy(orbitControls.target);

        scene.add(editableObject);

        transformControls.removeEventListener('mode-changed', forceIntoTranslateMode);
        transformControls.attach(editableObject);

        editableObjects.push(editableObject);
    };

    return {
        enterEditMode: () => {
            orbitControls.target = new THREE.Vector3();
            orbitControls.enablePan = true;

            scene.add(...editableObjects);
        },
        leaveEditMode: () => {
            transformControls.detach();
        },
        createGameWorldObjects: () => {
            editableObjects.forEach(object => scene.remove(object));

            return editableObjects
                // The editable starting object should not be added to the game world
                .filter(object => object !== editableStartingObject)
                .map(object => createGameWorldObject(object, editableFinishingObject));
        },
        getStartingPosition: () => {
            return editableStartingObject.position;
        },
        recenter: () => {
            if (transformControls.object === undefined) return;

            orbitControls.target.copy(transformControls.object.position);
        },
        loadLevel: (level) => {
            editableStartingObject.position.set(level.startingPosition.x, level.startingPosition.y, level.startingPosition.z);
            editableFinishingObject.position.set(level.finishingPosition.x, level.finishingPosition.y, level.finishingPosition.z);

            const loadedObjects = loadEditableObjects(level.obstacles);

            editableObjects.splice(0);

            editableObjects.push(
                editableStartingObject,
                editableFinishingObject,
                ...loadedObjects
            );
        },
        addBox: () => addBox(),
        changeColor: (color) => editableObjectColor = color,
        changeToTranslateMode: () => transformControls.mode = 'translate',
        changeToRotateMode: () => transformControls.mode = 'rotate',
        changeToScaleMode: () => transformControls.mode = 'scale',
        save: () => {
            const level = createLevel(editableStartingObject, editableFinishingObject, editableObjects);

            console.log('Saved Level:', level);

            createLevelFile(level);
        },
        onClick: (pointer) => {
            // Don't select a new object if we're actively transform some other object
            if (transformControls.dragging) return;

            const object = findObjectUnderPointer(pointer, mouseCoordinates, raycaster, camera, editableObjects);
            if (object === null) return;

            if (object === editableStartingObject || object === editableFinishingObject) {
                transformControls.mode = 'translate';
                transformControls.addEventListener('mode-changed', forceIntoTranslateMode);
            } else {
                transformControls.removeEventListener('mode-changed', forceIntoTranslateMode);
            }

            transformControls.attach(object);
        },
        update: (deltaTime, controllerDirection, mousePointer) => {
            const panOffset = (orbitControls as any)._panOffset as THREE.Vector3;
            panOffset.addScaledVector(controllerDirection, deltaTime * CAMERA_EDIT_SPEED);

            for (const object of editableObjects) {
                object.material.emissive.setHex(0x000000);
            }

            const object = findObjectUnderPointer(mousePointer, mouseCoordinates, raycaster, camera, editableObjects);

            if (object !== null && object !== transformControls.object) {
                object.material.emissive.setHex(0xFFFFFF);
            }
        }
    };
}

function createTransformControls(scene: THREE.Scene, camera: THREE.Camera, orbitControls: OrbitControls): TransformControls {
    const transformControls = new TransformControls(camera, orbitControls.domElement!);

    transformControls.addEventListener('dragging-changed', e => orbitControls.enabled = !e.value);

    scene.add(transformControls.getHelper());

    return transformControls;
}

function createEditableStartingObject(): THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial> {
    const editableStartingObject = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 16, 8),
        new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load(PlayerTexture), wireframe: true })
    );

    editableStartingObject.castShadow = true;

    return editableStartingObject;
}

function createEditableFinishingObject(): THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> {
    const editableFinishingObject = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load(CheckeredTexture), transparent: true, opacity: 0.6 })
    );

    editableFinishingObject.scale.set(3, 3, 3);
    editableFinishingObject.castShadow = true;

    return editableFinishingObject;
}

function createEditableObject(color: number): THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> {
    const editableObject = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: color })
    );

    editableObject.castShadow = true;
    editableObject.receiveShadow = true;

    return editableObject;
}

function createGameWorldObject(
    editableObject: THREE.Mesh,
    editableFinishingObject: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>
): GameWorldObject {
    const object = GameWorldObjectCreator.create({
        dimensions: {
            type: 'box',
            width: editableObject.scale.x,
            height: editableObject.scale.y,
            depth: editableObject.scale.z
        },
        material: editableObject === editableFinishingObject
            ? {
                type: 'texture',
                texture: editableFinishingObject.material.map!,
                opacity: editableFinishingObject.material.opacity
            }
            : {
                type: 'color',
                color: (editableObject.material as THREE.MeshStandardMaterial).color
            },
        mass: 0
    });

    if (editableObject === editableFinishingObject) {
        object.body.addEventListener('collide', (e: any) => console.log('Something has hit the finish!'));
    }

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

    return object;
}

function loadEditableObjects(obstacles: Obstacle[]): THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[] {
    return obstacles.map(obstacle => {
        const object = createEditableObject(obstacle.color);

        object.scale.set(
            obstacle.scale.x,
            obstacle.scale.y,
            obstacle.scale.z
        );

        object.position.set(
            obstacle.position.x,
            obstacle.position.y,
            obstacle.position.z
        );

        object.quaternion.set(
            obstacle.quaternion.x,
            obstacle.quaternion.y,
            obstacle.quaternion.z,
            obstacle.quaternion.w
        );

        return object;
    });
}

function findObjectUnderPointer(
    pointer: Pointer,
    mouseCoordinates: THREE.Vector2,
    raycaster: THREE.Raycaster,
    camera: THREE.Camera,
    objects: THREE.Mesh[]
): THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> | null {
    mouseCoordinates.x = (pointer.x / window.innerWidth) * 2 - 1;
    mouseCoordinates.y = - (pointer.y / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouseCoordinates, camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length === 0) return null;

    return intersects[0].object as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
}
