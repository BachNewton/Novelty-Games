import * as THREE from 'three';
import SavedLevel from './levels/level.json';

export interface Level {
    startingPosition: Position;
    finishingPosition: Position;
    obstacles: Obstacle[];
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
}

export function createLevel(
    startingObject: THREE.Mesh,
    finishingObject: THREE.Mesh,
    objects: THREE.Mesh[]
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
            .filter(object => object !== startingObject && object !== finishingObject)
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
                    color: (object.material as THREE.MeshStandardMaterial).color.getHex()
                };
            })
    };
}

export function createLevelFile(level: Level) {
    const json = JSON.stringify(level);

    console.log('Saved Level JSON:', json);

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'level';
    a.click();

    URL.revokeObjectURL(url);
}

export function loadLevel(): Level {
    return SavedLevel;
}
