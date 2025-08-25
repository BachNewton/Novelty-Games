import { KeyboardInput } from "../../../util/input/Keyboard";
import { createAnimator } from "../Animator";
import { Drawer } from "../Drawer";
import { GameObject } from "../GameWorld";
import { Box } from "../Geometry";
import { createVector } from "../Vector";
import { TILE_SIZE, tileLocationToPosition } from "./data/Tile";
import PlayerWalk from "./sprites/player_walk.png";

export interface Player extends GameObject { }

enum Direction { NONE, UP, DOWN, LEFT, RIGHT }

const SPEED = 2;

export function createPlayer(drawer: Drawer, keyboardInput: KeyboardInput): Player {
    const animator = getAnimator();
    animator.play('walkDown');

    const box: Box = {
        position: createVector(0, 0),
        width: TILE_SIZE,
        height: TILE_SIZE,
        getAnimationFrame: animator.getFrame
    };

    let direction: Direction = Direction.NONE;
    let x = 0;
    let y = 0;

    return {
        draw: () => {
            const { centerX, centerY } = tileLocationToPosition(x, y);

            box.position.set(centerX, centerY);

            drawer.draw(box);
        },

        update: (deltaTime) => {
            if (keyboardInput.movementAxis.x > 0) {
                direction = Direction.RIGHT;
                animator.play('walkRight');
            } else if (keyboardInput.movementAxis.x < 0) {
                direction = Direction.LEFT;
                animator.play('walkLeft');
            } else if (keyboardInput.movementAxis.y > 0) {
                direction = Direction.UP;
                animator.play('walkUp');
            } else if (keyboardInput.movementAxis.y < 0) {
                direction = Direction.DOWN;
                animator.play('walkDown');
            } else {
                direction = Direction.NONE;
            }
        }
    };
}

function getAnimator() {
    return createAnimator({
        imageSrc: PlayerWalk,
        rows: 4,
        cols: 6,
        animations: {
            walkDown: {
                startingRow: 0,
                startingCol: 0,
                frames: 6
            },
            walkLeft: {
                startingRow: 1,
                startingCol: 0,
                frames: 6
            },
            walkRight: {
                startingRow: 2,
                startingCol: 0,
                frames: 6
            },
            walkUp: {
                startingRow: 3,
                startingCol: 0,
                frames: 6
            }
        },
        frameRate: 250,
        padding: 17
    }, true);
}
