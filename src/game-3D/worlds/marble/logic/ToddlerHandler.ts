import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createNetworkService, NetworkedApplication } from "../../../../util/NetworkService";
import { Color, Shape, ToddlerServerData } from "../../../toddler/ToddlerServerData";
import { GameWorldObject, GameWorldObjectCreator } from "../../GameWorldObject";
import { Player } from './Player';

export function handleToddler(
    scene: THREE.Scene,
    world: CANNON.World,
    player: Player,
    toddlerObjects: GameWorldObject[]
) {
    const networkService = createNetworkService<ToddlerServerData>(NetworkedApplication.MARBLE);

    networkService.setNetworkEventListener(data => {
        const object = GameWorldObjectCreator.create({
            dimensions: data.shape === Shape.SPHERE
                ? {
                    type: 'sphere',
                    radius: 0.75
                }
                : {
                    type: 'box',
                    width: 1,
                    height: 1,
                    depth: 1
                },
            visualMaterial: {
                type: 'color',
                color: getColor(data.color)
            },
            mass: 1
        });

        const playerPosition = player.getPosition();
        const playerVelocity = player.getVelocity();

        object.body.position.copy(playerPosition);
        object.body.position.y += 2;
        object.body.velocity.copy(playerVelocity)

        object.add(scene, world);

        toddlerObjects.push(object);
    });
}

function getColor(color: Color): THREE.ColorRepresentation {
    switch (color) {
        case Color.RED:
            return 'red';
        case Color.BLUE:
            return 'blue';
        case Color.GREEN:
            return 'green';
        case Color.YELLOW:
            return 'yellow';
        case Color.PURPLE:
            return 'purple';
        case Color.ORANGE:
            return 'orange';
    }
}
