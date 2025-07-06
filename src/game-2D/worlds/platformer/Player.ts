import { KeyboardInput } from "../../../util/input/Keyboard";
import { Drawer } from "../Drawer";
import { GameObject } from "../GameWorld";
import { Box, Point } from "../Geometry";

interface Player extends GameObject { }

export function createPlayer(drawer: Drawer, keyboardInput: KeyboardInput): Player {
    const position: Point = { x: 0, y: 0 };

    const box: Box = {
        position,
        width: 50,
        height: 50,
        color: 'blue'
    };

    let speed = 0.4;

    return {
        draw: () => {
            drawer.draw(box);
        },
        update: (deltaTime: number) => {
            if (keyboardInput.held.KeyW) {
                position.y -= speed * deltaTime;
            }
            if (keyboardInput.held.KeyS) {
                position.y += speed * deltaTime;
            }
            if (keyboardInput.held.KeyA) {
                position.x -= speed * deltaTime;
            }
            if (keyboardInput.held.KeyD) {
                position.x += speed * deltaTime;
            }
        }
    };
}
