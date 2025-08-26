import { KeyboardInput } from "../../../util/input/Keyboard";
import { createAnimator } from "../Animator";
import { Drawer } from "../Drawer";
import { GameObject } from "../GameWorld";
import { Box } from "../Geometry";
import { createVector } from "../Vector";
import { TILE_SIZE, tileLocationToPosition } from "./data/Tile";
import PlayerWalk from "./spritesheet/player_walk.png";
import PlayerIdle from "./spritesheet/player_idle.png";

export interface Player extends GameObject { }

const SPEED = 4; // Speed in pixels per frame for the movement animation

enum Direction { UP, DOWN, LEFT, RIGHT }

export function createPlayer(drawer: Drawer, keyboardInput: KeyboardInput): Player {
    const animator = getAnimator();
    animator.play('idleDown'); // Start with a default animation

    // Grid position (the player's "logical" location on the map)
    let x = 0;
    let y = 0;

    // Get the starting pixel position from the grid coordinates
    const { centerX: startPixelX, centerY: startPixelY } = tileLocationToPosition(x, y);

    const box: Box = {
        position: createVector(startPixelX, startPixelY),
        width: TILE_SIZE,
        height: TILE_SIZE,
        getAnimationFrame: animator.getFrame
    };

    let isMoving = false;
    let currentDirection: Direction = Direction.DOWN;

    return {
        draw: () => {
            // The box's position is updated directly in the update loop for smoothness
            drawer.draw(box);
        },

        update: (deltaTime) => {
            if (isMoving) {
                // --- Smoothly slide to target tile ---
                const { centerX: targetPixelX, centerY: targetPixelY } = tileLocationToPosition(x, y);
                const currentPos = box.position;

                if (currentPos.x < targetPixelX) {
                    currentPos.x = Math.min(currentPos.x + SPEED, targetPixelX);
                } else if (currentPos.x > targetPixelX) {
                    currentPos.x = Math.max(currentPos.x - SPEED, targetPixelX);
                }

                if (currentPos.y < targetPixelY) {
                    currentPos.y = Math.min(currentPos.y + SPEED, targetPixelY);
                } else if (currentPos.y > targetPixelY) {
                    currentPos.y = Math.max(currentPos.y - SPEED, targetPixelY);
                }

                // Reached target tile
                if (currentPos.x === targetPixelX && currentPos.y === targetPixelY) {
                    isMoving = false;
                }
            }

            // --- If not moving, check for new input ---
            if (!isMoving) {
                let moved = false;
                let newDirection: Direction = currentDirection;

                if (keyboardInput.movementAxis.y > 0) {
                    y++;
                    newDirection = Direction.UP;
                    moved = true;
                } else if (keyboardInput.movementAxis.y < 0) {
                    y--;
                    newDirection = Direction.DOWN;
                    moved = true;
                } else if (keyboardInput.movementAxis.x < 0) {
                    x--;
                    newDirection = Direction.LEFT;
                    moved = true;
                } else if (keyboardInput.movementAxis.x > 0) {
                    x++;
                    newDirection = Direction.RIGHT;
                    moved = true;
                }

                if (moved) {
                    isMoving = true;

                    if (newDirection !== currentDirection) {
                        currentDirection = newDirection;
                    }

                    // ✅ Always play walk when movement starts
                    if (currentDirection === Direction.UP) animator.play('walkUp');
                    if (currentDirection === Direction.DOWN) animator.play('walkDown');
                    if (currentDirection === Direction.LEFT) animator.play('walkLeft');
                    if (currentDirection === Direction.RIGHT) animator.play('walkRight');
                } else {
                    // ✅ Only here do we play idle (no input AND not moving)
                    if (currentDirection === Direction.UP) animator.play('idleUp');
                    if (currentDirection === Direction.DOWN) animator.play('idleDown');
                    if (currentDirection === Direction.LEFT) animator.play('idleLeft');
                    if (currentDirection === Direction.RIGHT) animator.play('idleRight');
                }
            }
        }
    };
}

function getAnimator() {
    return createAnimator({
        spritesheets: {
            walk: {
                src: PlayerWalk,
                rows: 4,
                cols: 6,
                padding: 17
            },
            idle: {
                src: PlayerIdle,
                rows: 4,
                cols: 12,
                padding: 17
            }
        },
        animations: {
            walkDown: {
                startingRow: 0,
                startingCol: 0,
                frames: 6,
                imageKey: 'walk'
            },
            walkLeft: {
                startingRow: 1,
                startingCol: 0,
                frames: 6,
                imageKey: 'walk'
            },
            walkRight: {
                startingRow: 2,
                startingCol: 0,
                frames: 6,
                imageKey: 'walk'
            },
            walkUp: {
                startingRow: 3,
                startingCol: 0,
                frames: 6,
                imageKey: 'walk'
            },
            idleDown: {
                imageKey: 'idle',
                startingRow: 0,
                startingCol: 0,
                frames: 12
            },
            idleLeft: {
                imageKey: 'idle',
                startingRow: 1,
                startingCol: 0,
                frames: 12
            },
            idleRight: {
                imageKey: 'idle',
                startingRow: 2,
                startingCol: 0,
                frames: 12
            },
            idleUp: {
                imageKey: 'idle',
                startingRow: 3,
                startingCol: 0,
                frames: 4
            }
        },
        frameRate: 150
    }, true);
}
