import { Route, updateRoute } from "../../../ui/Routing";
import { createKeyboardInput } from "../../../util/input/Keyboard";
import { Drawer } from "../Drawer";
import { GameWorld } from "../GameWorld";
import { Box } from "../Geometry";
import { createPlayer } from "./Player";

export function createPlatformerWorld(drawer: Drawer): GameWorld {
    updateRoute(Route.PLATFORMER);

    const keyboardInput = createKeyboardInput((key) => {
        console.log(`Key pressed: ${key}`);
    });

    const obstacles: Box[] = [];
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
        }
    };
}
