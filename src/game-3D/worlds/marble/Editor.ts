import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { TransformControls, OrbitControls, TextGeometry, FontLoader, RoundedBoxGeometry } from 'three/examples/jsm/Addons';
import FontData from 'three/examples/fonts/helvetiker_regular.typeface.json';
import { Dimensions, GameWorldObject, GameWorldObjectCreator } from '../GameWorldObject';
import PlayerTexture from './textures/player.png';
import CheckeredTexture from './textures/checkered.jpg';
import { createLevel, Level, Obstacle, createLevelFile } from './Level';
import { Pointer } from '../../input/Mouse';
import { State } from './MarbleWorld';
import { GameMaterial } from './GameMaterial';
import { createCollectible } from './Collectible';

const CAMERA_EDIT_SPEED = 0.02;
export const DEFAULT_COLOR = 0xCED3D4;
export const DEFAULT_MATERIAL = GameMaterial.NORMAL;

interface Editor {
    enterEditMode: () => void;
    leaveEditMode: () => void;
    createGameWorldObjects(
        onCollideWithFinish: () => void,
        onCollideWithCollectible: (collectible: GameWorldObject) => void,
        updateTotalCollectibles: (totalCollectibles: number) => void
    ): GameWorldObject[];
    getStartingPosition: () => THREE.Vector3;
    recenter: () => void;
    save: () => void;
    load: (level: Level, worldState: State) => void;
    addBox: () => void;
    addCollectible: () => void;
    delete: () => void;
    clone: () => void;
    changeColor: (color: number) => void;
    changeMaterial: (material: GameMaterial) => void;
    changeToTranslateMode: () => void;
    changeToRotateMode: () => void;
    changeToScaleMode: () => void;
    onClick: (pointer: Pointer) => void;
    update: (deltaTime: number, controllerDirection: THREE.Vector3, mousePointer: Pointer) => void;
}

interface EditorCreator {
    create: (
        scene: THREE.Scene,
        camera: THREE.Camera,
        orbitControls: OrbitControls,
        bouncyMaterial: CANNON.Material,
        slipperyMaterial: CANNON.Material
    ) => Editor;
}

export const EditorCreator: EditorCreator = {
    create: (scene, camera, orbitControls, bouncyMaterial, slipperyMaterial) => createEditor(scene, camera, orbitControls, bouncyMaterial, slipperyMaterial)
};

function createEditor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    orbitControls: OrbitControls,
    bouncyMaterial: CANNON.Material,
    slipperyMaterial: CANNON.Material
): Editor {
    const transformControls = createTransformControls(scene, camera, orbitControls);
    const editableStartingObject = createEditableStartingObject();

    const editableFinishingObject = createEditableFinishingObject();
    const finishingObjectSign = createFinishingObjectSign();
    editableFinishingObject.add(finishingObjectSign);

    const collectibles = new Set<THREE.Mesh>();

    const editableObjects: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[] = [];
    let editableObjectColor = DEFAULT_COLOR;
    let editableObjectMaterial = DEFAULT_MATERIAL;
    const raycaster = new THREE.Raycaster();
    const mouseCoordinates = new THREE.Vector2();

    const forceIntoTranslateMode = () => transformControls.mode = 'translate';

    const transformControlsObject = (
        excludeSpecialObjects: boolean,
        excludeCollectibles: boolean,
        provideObject: (object: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>) => void
    ) => {
        if (transformControls.object === undefined) return;

        const object = transformControls.object as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;

        if (excludeSpecialObjects && (object === editableStartingObject || object === editableFinishingObject)) return;
        if (excludeCollectibles && collectibles.has(object)) return;

        provideObject(object);
    };

    const getPhysicalMeterial: (material: GameMaterial) => CANNON.Material | undefined = (material) => {
        switch (material) {
            case GameMaterial.BOUNCY:
                return bouncyMaterial;
            case GameMaterial.SLIPPERY:
                return slipperyMaterial;
            default:
                return undefined;
        }
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
        createGameWorldObjects: (onCollideWithFinish, onCollideWithCollectible, updateTotalCollectibles) => {
            editableObjects.forEach(object => scene.remove(object));

            updateTotalCollectibles(collectibles.size);

            return editableObjects
                // The editable starting object should not be added to the game world
                .filter(object => object !== editableStartingObject)
                .map(object => createAndUpdateGameWorldObject(
                    object,
                    collectibles,
                    editableFinishingObject,
                    camera.position,
                    onCollideWithFinish,
                    onCollideWithCollectible,
                    getPhysicalMeterial(object.userData.gameMaterial)
                ));
        },
        getStartingPosition: () => {
            return editableStartingObject.position;
        },
        recenter: () => transformControlsObject(false, false, object => orbitControls.target.copy(object.position)),
        save: () => {
            const level = createLevel(editableStartingObject, editableFinishingObject, editableObjects, collectibles);

            console.log('Saved Level:', level);

            createLevelFile(level);
        },
        load: (level, worldState) => {
            scene.remove(...editableObjects);

            editableStartingObject.position.set(level.startingPosition.x, level.startingPosition.y, level.startingPosition.z);
            editableFinishingObject.position.set(level.finishingPosition.x, level.finishingPosition.y, level.finishingPosition.z);

            const loadedObjects = loadEditableObjects(level.obstacles);

            const loadedCollectibles = level.collectibles.map(position => {
                const collectible = createCollectible();

                collectible.body.position.set(position.x, position.y, position.z);
                collectible.update();

                return collectible.mesh;
            });

            editableObjects.splice(0);
            collectibles.clear();

            editableObjects.push(
                editableStartingObject,
                editableFinishingObject,
                ...loadedCollectibles,
                ...loadedObjects
            );

            loadedCollectibles.forEach(collectible => collectibles.add(collectible));

            if (worldState === State.EDIT) {
                transformControls.detach();
                scene.add(...editableObjects);
            }
        },
        addBox: () => {
            const editableObject = createEditableObject(editableObjectColor, editableObjectMaterial);

            editableObject.position.copy(orbitControls.target);

            scene.add(editableObject);

            transformControls.removeEventListener('mode-changed', forceIntoTranslateMode);
            transformControls.attach(editableObject);

            editableObjects.push(editableObject);
        },
        addCollectible: () => {
            const collectible = createCollectible().mesh;

            collectible.position.copy(orbitControls.target);

            scene.add(collectible);

            transformControls.removeEventListener('mode-changed', forceIntoTranslateMode);
            transformControls.mode = 'translate';
            transformControls.addEventListener('mode-changed', forceIntoTranslateMode);

            transformControls.attach(collectible);

            collectibles.add(collectible);
            editableObjects.push(collectible);

        },
        delete: () => transformControlsObject(true, false, object => {
            scene.remove(object);

            const objectIndex = editableObjects.indexOf(object);
            editableObjects.splice(objectIndex, 1);

            collectibles.delete(object);

            transformControls.detach();
        }),
        clone: () => transformControlsObject(true, false, object => {
            const clone = object.clone();
            clone.material = object.material.clone();

            scene.add(clone);
            editableObjects.push(clone);

            if (collectibles.has(object)) {
                collectibles.add(clone);
            }

            transformControls.attach(clone);
        }),
        changeColor: (color) => {
            editableObjectColor = color;
            transformControlsObject(true, true, object => object.material.color.set(color));
        },
        changeMaterial: (material) => {
            editableObjectMaterial = material;

            transformControlsObject(true, true, object => {
                applyVisualMeterial(object, material);
                object.geometry.dispose();
                object.geometry = createEditableObjectGeometry(material);
            });
        },
        changeToTranslateMode: () => transformControls.mode = 'translate',
        changeToRotateMode: () => transformControls.mode = 'rotate',
        changeToScaleMode: () => transformControls.mode = 'scale',
        onClick: (pointer) => {
            // Don't select a new object if we're actively transform some other object
            if (transformControls.dragging) return;

            const object = findObjectUnderPointer(pointer, mouseCoordinates, raycaster, camera, editableObjects);
            if (object === null) return;

            if (object === editableStartingObject || object === editableFinishingObject || collectibles.has(object)) {
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

            finishingObjectSign.lookAt(camera.position);
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
        new THREE.BoxGeometry(3, 3, 3),
        new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load(CheckeredTexture), transparent: true, opacity: 0.6 })
    );

    editableFinishingObject.castShadow = true;

    return editableFinishingObject;
}

function createFinishingObjectSign(): THREE.Mesh {
    const text = 'Goal';
    const size = 2.5;
    const depth = 0.1;

    const sign = new THREE.Mesh(
        new TextGeometry(text, {
            font: new FontLoader().parse(FontData),
            size: size,
            depth: depth
        }),
        new THREE.MeshBasicMaterial()
    );

    sign.geometry.computeBoundingBox();

    const boundingBox = sign.geometry.boundingBox;
    if (boundingBox !== null) {
        const centerX = (boundingBox.max.x + boundingBox.min.x) / 2;
        const centerY = (boundingBox.max.y + boundingBox.min.y) / 2;
        const centerZ = (boundingBox.max.z + boundingBox.min.z) / 2;

        sign.geometry.translate(-centerX, -centerY, -centerZ)
    }

    sign.translateY(4);

    return sign;
}

function applyVisualMeterial(object: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>, material: GameMaterial) {
    if (material === undefined) throw new Error('GameMaterial is undefined');

    object.userData.gameMaterial = material;

    if (material === GameMaterial.NORMAL) {
        object.material.roughness = 1;
        object.material.metalness = 0;
    } else if (material === GameMaterial.SLIPPERY) {
        object.material.roughness = 0;
        object.material.metalness = 1;
    } else if (material === GameMaterial.BOUNCY) {
        object.material.roughness = 0;
        object.material.metalness = 0;
    }
}

function createEditableObjectGeometry(material: GameMaterial): THREE.BufferGeometry {
    return new RoundedBoxGeometry(1, 1, 1, undefined, material === GameMaterial.BOUNCY ? Math.PI / 32 : 0);
}

function createEditableObject(color: number, material: GameMaterial): THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> {
    const editableObject = new THREE.Mesh(
        createEditableObjectGeometry(material),
        new THREE.MeshStandardMaterial({ color: color })
    );

    editableObject.castShadow = true;
    editableObject.receiveShadow = true;

    applyVisualMeterial(editableObject, material);

    return editableObject;
}

function createAndUpdateGameWorldObject(
    editableObject: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>,
    collectibles: Set<THREE.Mesh>,
    editableFinishingObject: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>,
    cameraPosition: THREE.Vector3,
    onCollideWithFinish: () => void,
    onCollideWithCollectible: (collectible: GameWorldObject) => void,
    physicalMaterial: CANNON.Material | undefined
): GameWorldObject {
    const isCollectible = collectibles.has(editableObject);

    const object = isCollectible
        ? createCollectible()
        : createGameWorldObject(editableObject, editableFinishingObject, physicalMaterial);

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

    if (editableObject === editableFinishingObject) {
        object.body.addEventListener('collide', onCollideWithFinish);

        const finishingObjectSign = createFinishingObjectSign();
        object.mesh.add(finishingObjectSign);
        object.update = () => finishingObjectSign.lookAt(cameraPosition);
    } else if (isCollectible) {
        object.body.addEventListener('collide', () => onCollideWithCollectible(object));
    } else {
        applyVisualMeterial(object.mesh, editableObject.userData.gameMaterial);
    }

    return object;
}

function createGameWorldObject(
    editableObject: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>,
    editableFinishingObject: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>,
    physicalMaterial: CANNON.Material | undefined
): GameWorldObject {
    const dimensions: Dimensions = editableObject === editableFinishingObject
        ? {
            type: 'box',
            width: editableFinishingObject.geometry.parameters.width,
            height: editableFinishingObject.geometry.parameters.height,
            depth: editableFinishingObject.geometry.parameters.depth
        }
        : {
            type: 'box',
            width: editableObject.scale.x,
            height: editableObject.scale.y,
            depth: editableObject.scale.z,
            radius: editableObject.userData.gameMaterial === GameMaterial.BOUNCY ? Math.PI : 0
        };

    return GameWorldObjectCreator.create({
        dimensions: dimensions,
        visualMaterial: editableObject === editableFinishingObject
            ? {
                type: 'texture',
                texture: editableFinishingObject.material.map!,
                opacity: editableFinishingObject.material.opacity
            }
            : {
                type: 'color',
                color: editableObject.material.color
            },
        physicalMaterial: physicalMaterial,
        mass: 0
    });
}

function loadEditableObjects(obstacles: Obstacle[]): THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[] {
    return obstacles.map(obstacle => {
        const object = createEditableObject(obstacle.color, obstacle.material);

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
