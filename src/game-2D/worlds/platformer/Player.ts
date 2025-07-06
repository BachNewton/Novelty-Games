import { Key, KeyboardInput } from "../../../util/input/Keyboard";
import { Drawer } from "../Drawer";
import { GameObject } from "../GameWorld";
import { MovingBox } from "../Geometry";
import { createVector, Vector } from "../Vector";

interface Player extends GameObject, MovingBox {
    applyAcceleration: (acceleration: Vector) => void;
}

export function createPlayer(drawer: Drawer, keyboardInput: KeyboardInput): Player {
    const position = createVector(0, 0);
    const velocity = createVector(0, 0);

    const object: MovingBox = {
        position,
        width: 50,
        height: 50,
        color: 'blue',
        velocity: velocity
    };

    let speed = 0.02;
    const jumpSpeed = createVector(0, -0.75);

    keyboardInput.addKeyListener((key) => {
        if (key === Key.SPACE) {
            velocity.add(jumpSpeed);
        }
    });

    return {
        draw: () => {
            drawer.draw(object);
        },
        update: (deltaTime: number) => {
            const movementAxis = keyboardInput.movementAxis;

            if (movementAxis.x !== 0) {
                velocity.x += movementAxis.x * speed;
            }

            position.add(velocity, deltaTime);
        },
        ...object,
        applyAcceleration: (acceleration) => velocity.add(acceleration)
    };
}
