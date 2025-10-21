import * as THREE from 'three';
import { GameMaterial } from './GameMaterial';
import { createFile, FileType, loadFile } from '../../../../util/File';

export interface Level {
    startingPosition: Position;
    finishingPosition: Position;
    obstacles: Obstacle[];
    collectibles: Position[];
    metadata: LevelMetadata;
}

interface Vector3 {
    x: number;
    y: number;
    z: number;
}

interface Position extends Vector3 { }
interface Scale extends Vector3 { }

interface Quaternion extends Vector3 {
    w: number;
}

export interface Obstacle {
    position: Position;
    quaternion: Quaternion;
    scale: Scale;
    color: number;
    material: GameMaterial;
}

export interface LevelMetadata {
    'Level Name': string;
    'Bronze Time': number,
    'Silver Time': number,
    'Gold Time': number,
    'Diamond Time': number
}

export function createLevel(
    startingObject: THREE.Mesh,
    finishingObject: THREE.Mesh,
    objects: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[],
    collectibles: Set<THREE.Mesh>,
    levelMetadata: LevelMetadata
): Level {
    return {
        startingPosition: {
            x: startingObject.position.x,
            y: startingObject.position.y,
            z: startingObject.position.z
        },
        finishingPosition: {
            x: finishingObject.position.x,
            y: finishingObject.position.y,
            z: finishingObject.position.z
        },
        obstacles: objects
            .filter(object => object !== startingObject && object !== finishingObject && !collectibles.has(object))
            .map(object => {
                return {
                    position: {
                        x: object.position.x,
                        y: object.position.y,
                        z: object.position.z
                    },
                    quaternion: {
                        x: object.quaternion.x,
                        y: object.quaternion.y,
                        z: object.quaternion.z,
                        w: object.quaternion.w
                    },
                    scale: {
                        x: object.scale.x,
                        y: object.scale.y,
                        z: object.scale.z
                    },
                    color: object.material.color.getHex(),
                    material: object.userData.gameMaterial
                };
            }),
        collectibles: Array.from(collectibles).map(collectible => {
            return {
                x: collectible.position.x,
                y: collectible.position.y,
                z: collectible.position.z
            }
        }),
        metadata: levelMetadata
    };
}

export function createLevelFile(level: Level) {
    const json = JSON.stringify(level);

    console.log('Saved Level JSON:', json);

    const levelName = level.metadata['Level Name'];
    const fileName = levelName === '' ? 'level' : levelName;

    createFile(FileType.JSON, fileName, json);
}

export function loadLevelFile(): Promise<Level> {
    return loadFile(FileType.JSON);
}
