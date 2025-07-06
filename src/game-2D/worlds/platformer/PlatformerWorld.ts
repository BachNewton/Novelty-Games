import { Route, updateRoute } from "../../../ui/Routing";
import { createKeyboardInput } from "../../../util/input/Keyboard";
import { Drawer } from "../Drawer";
import { GameWorld } from "../GameWorld";
import { Box, isColliding } from "../Geometry";
import { createPlayer } from "./Player";

export function createPlatformerWorld(drawer: Drawer): GameWorld {
    updateRoute(Route.PLATFORMER);

    const keyboardInput = createKeyboardInput((key) => {
        console.log(`Key pressed: ${key}`);
    });

    const obstacles: Box[] = [
        { position: { x: 250, y: 250 }, width: 250, height: 250 },
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
                    console.log("Collision detected with obstacle!");
                    // Handle collision response here, e.g., stop player movement
                }
            }
        }
    };
}
