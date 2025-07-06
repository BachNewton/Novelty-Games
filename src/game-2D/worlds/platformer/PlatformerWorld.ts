import { Route, updateRoute } from "../../../ui/Routing";
import { createKeyboardInput } from "../../../util/input/Keyboard";
import { Camera } from "../Camera";
import { Drawer } from "../Drawer";
import { GameWorld } from "../GameWorld";
import { Box, isColliding, resolveCollision } from "../Geometry";
import { createPlayer } from "./Player";

export function createPlatformerWorld(drawer: Drawer, camera: Camera): GameWorld {
    updateRoute(Route.PLATFORMER);

    const keyboardInput = createKeyboardInput((key) => {
        console.log(`Key pressed: ${key}`);
    });

    const obstacles: Box[] = [
        { position: { x: 200, y: 250 }, width: 250, height: 250 },
        { position: { x: 600, y: 250 }, width: 100, height: 100 },
        { position: { x: 200, y: 600 }, width: 100, height: 100 }
    ];

    const player = createPlayer(drawer, keyboardInput);

    return {
        draw: () => {
            for (const obstacle of obstacles) {
                drawer.draw(obstacle);
            }

            player.draw();
        },
        update: (deltaTime) => {
            player.update(deltaTime);

            for (const obstacle of obstacles) {
                if (isColliding(player, obstacle)) {
                    resolveCollision(player, obstacle);
                }
            }

            camera.centerOn(player);
        }
    };
}
