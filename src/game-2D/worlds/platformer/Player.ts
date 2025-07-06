import { KeyboardInput } from "../../../util/input/Keyboard";
import { Drawer } from "../Drawer";
import { GameObject } from "../GameWorld";
import { Box, Vector } from "../Geometry";

interface Player extends GameObject, Box { }

export function createPlayer(drawer: Drawer, keyboardInput: KeyboardInput): Player {
    const position: Vector = { x: 0, y: 0 };
    const velocity: Vector = { x: 0, y: 0 };

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
            const movementAxis = keyboardInput.movementAxis;

            if (movementAxis.x !== 0 || movementAxis.y !== 0) {
                velocity.x = movementAxis.x * speed * deltaTime;
                velocity.y = movementAxis.y * speed * deltaTime;
            } else {
                velocity.x = 0;
                velocity.y = 0;
            }

            position.x += velocity.x;
            position.y += velocity.y;
        },
        ...box
    };
}
