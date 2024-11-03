import { GameWorldObject, GameWorldObjectCreator } from "../GameWorldObject";

export function createPlaygroundGameWorldObjects(): GameWorldObject[] {
    const floor = GameWorldObjectCreator.create({
        dimensions: {
            type: 'box',
            width: 20,
            height: 1,
            depth: 20
        },
        material: {
            type: 'color',
            color: 'lightblue'
        },
        mass: 0
    });
    floor.body.position.y = -2;

    const ramp = GameWorldObjectCreator.create({
        dimensions: {
            type: 'box',
            width: 5,
            height: 0.5,
            depth: 5
        },
        material: {
            type: 'color',
            color: 'lightgreen'
        },
        mass: 0
    });
    ramp.body.position.set(0, 1, -7);
    ramp.body.quaternion.setFromEuler(Math.PI / 4, 0, 0);

    const steepRamp = GameWorldObjectCreator.create({
        dimensions: {
            type: 'box',
            width: 5,
            height: 0.5,
            depth: 5
        },
        material: {
            type: 'color',
            color: 'pink'
        },
        mass: 0
    });
    steepRamp.body.position.set(-7, 1, 0);
    steepRamp.body.quaternion.setFromEuler(0, 0, -Math.PI / 3);

    const longRamp = GameWorldObjectCreator.create({
        dimensions: {
            type: 'box',
            width: 25,
            height: 0.5,
            depth: 2
        },
        material: {
            type: 'color',
            color: 'mediumpurple'
        },
        mass: 0
    });
    longRamp.body.position.set(20, -1, 0);
    longRamp.body.quaternion.setFromEuler(0, 0, Math.PI / 10);

    return [floor, ramp, steepRamp, longRamp];
}
