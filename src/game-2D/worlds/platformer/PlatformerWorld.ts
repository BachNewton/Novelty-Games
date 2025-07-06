import { Route, updateRoute } from "../../../ui/Routing";
import { createKeyboardInput } from "../../../util/input/Keyboard";
import { Drawer } from "../Drawer";
import { GameWorld } from "../GameWorld";
import { Box } from "../Geometry";

export function createPlatformerWorld(drawer: Drawer): GameWorld {
    updateRoute(Route.PLATFORMER);

    const keyboardInput = createKeyboardInput((key) => {
        console.log(`Key pressed: ${key}`);
    });

    const obstacles: Box[] = [
        { x: 50, y: 300, width: 100, height: 20 },
        { x: 200, y: 250, width: 100, height: 20 },
        { x: 350, y: 200, width: 100, height: 20 },
        { x: 500, y: 150, width: 100, height: 20 },
        { x: 650, y: 100, width: 100, height: 20 }
    ];

    let x = 0;
    let y = 0;
    const player: Box = { x: x, y: y, width: 50, height: 50, color: 'blue' };

    return {
        draw: () => {
            for (const obstacle of obstacles) {
                drawer.draw(obstacle);
                drawer.draw(player);
            }
        },
        update: (deltaTime) => {
            // TODO
        }
    };
}
