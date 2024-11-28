import * as THREE from 'three';
import { GameMaterial } from './GameMaterial';

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

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const levelName = level.metadata['Level Name']
    const a = document.createElement('a');
    a.href = url;
    a.download = levelName === '' ? 'level' : levelName;
    a.click();

    URL.revokeObjectURL(url);
}

export function loadLevelFile(): Promise<Level> {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    const fileReader = new FileReader();

    input.addEventListener('change', _ => {
        if (input.files === null || input.files.length === 0) return;

        const file = input.files[0];

        fileReader.readAsText(file);
    });

    input.click();

    return new Promise((resolve, reject) => {
        fileReader.addEventListener('load', e => {
            const json = fileReader.result;

            if (json === null || json instanceof ArrayBuffer) return reject();

            console.log('Loaded Level JSON:', json);

            resolve(JSON.parse(json));
        });
    });
}
