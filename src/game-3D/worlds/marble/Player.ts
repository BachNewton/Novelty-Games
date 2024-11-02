import { GameWorldObjectCreator } from "../GameWorldObject";
import PlayerTexture from './textures/player.png';

interface Player {
    update(): void;
}

interface PlayerCreator {
    create(): Player;
}

export const PlayerCreator: PlayerCreator = {
    create: () => {
        const player = GameWorldObjectCreator.create({
            dimensions: {
                type: 'sphere',
                radius: 0.5
            },
            material: {
                type: 'texture',
                texturePath: PlayerTexture
            },
            mass: 1
        });

        return {
            update: () => {
                // camera.getWorldDirection(cameraForward);
                // cameraForward.setY(0).normalize();
                // cameraLeft.crossVectors(camera.up, cameraForward);

                // playerIntendedDirection.set(0, 0, 0);
                // playerIntendedDirection.addScaledVector(cameraForward, -controller.leftAxis.y);
                // playerIntendedDirection.addScaledVector(cameraLeft, -controller.leftAxis.x);

                // playerBodyIntendedDirection.set(playerIntendedDirection.x, 0, playerIntendedDirection.z);
                // playerBodyIntendedDirection.cross(world.gravity, playerTorque);
                // playerTorque.scale(deltaTime * PLAYER_SPEED);
                // player.body.applyTorque(playerTorque);

                // cameraForwardHelper.setDirection(cameraForward);
                // cameraLeftHelper.setDirection(cameraLeft);
                // playerIntendedDirectionHelper.setDirection(playerIntendedDirection);
                // playerIntendedDirectionHelper.setLength(3 * Math.hypot(controller.leftAxis.x, controller.leftAxis.y));
            }
        };
    }
};
