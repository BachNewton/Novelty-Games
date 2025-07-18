import { KeyboardInput } from "../../../util/input/Keyboard";
import { Drawer } from "../Drawer";
import { GameObject } from "../GameWorld";
import { MovingBox } from "../Geometry";
import { createVector, Vector } from "../Vector";

const SPEED = 0.02;
const JUMP_SPEED = 0.75;
const JUMP_CONTROL = 0.2;

interface Player extends GameObject, MovingBox {
    applyAcceleration: (acceleration: Vector) => void;
    updateIsOnGround: (isOnGround: boolean) => void;
}

export function createPlayer(drawer: Drawer, keyboardInput: KeyboardInput): Player {
    const position = createVector(0, 0);
    const velocity = createVector(0, 0);
    const jumpSpeed = createVector(0, -JUMP_SPEED);
    let isOnGround = false;

    const object: MovingBox = {
        position,
        width: 50,
        height: 50,
        color: 'blue',
        velocity: velocity
    };

    return {
        ...object,
        draw: () => {
            drawer.draw(object);
        },
        update: (deltaTime: number) => {
            if (keyboardInput.held.Space && isOnGround) {
                velocity.add(jumpSpeed);
                isOnGround = false;
            }

            const movementAxis = keyboardInput.movementAxis;

            if (movementAxis.x !== 0) {
                const speed = isOnGround ? SPEED : SPEED * JUMP_CONTROL;
                velocity.x += movementAxis.x * speed;
            }

            position.add(velocity, deltaTime);
        },
        applyAcceleration: (acceleration) => velocity.add(acceleration),
        updateIsOnGround: (isOnGroundUpdate: boolean) => isOnGround = isOnGroundUpdate
    };
}
