import { KeyboardInput } from "../../../util/input/Keyboard";
import { createAnimator } from "../Animator";
import { Drawer } from "../Drawer";
import { GameObject } from "../GameWorld";
import { Box } from "../Geometry";
import { createVector } from "../Vector";
import { TILE_SIZE, tileLocationToPosition } from "./data/Tile";
import PlayerWalk from "./sprites/player_walk.png";

export interface Player extends GameObject { }

const SPEED = 4; // Speed in pixels per frame for the movement animation

enum Direction { UP, DOWN, LEFT, RIGHT }

export function createPlayer(drawer: Drawer, keyboardInput: KeyboardInput): Player {
    const animator = getAnimator();
    animator.play('walkDown'); // Start with a default animation

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
                // --- If moving, smoothly slide to the target tile ---
                const { centerX: targetPixelX, centerY: targetPixelY } = tileLocationToPosition(x, y);
                const currentPos = box.position;

                // Move horizontally towards the target
                if (currentPos.x < targetPixelX) {
                    currentPos.x = (Math.min(currentPos.x + SPEED, targetPixelX));
                } else if (currentPos.x > targetPixelX) {
                    currentPos.x = (Math.max(currentPos.x - SPEED, targetPixelX));
                }

                // Move vertically towards the target
                if (currentPos.y < targetPixelY) {
                    currentPos.y = (Math.min(currentPos.y + SPEED, targetPixelY));
                } else if (currentPos.y > targetPixelY) {
                    currentPos.y = (Math.max(currentPos.y - SPEED, targetPixelY));
                }

                // Check if we've arrived at the destination tile
                if (currentPos.x === targetPixelX && currentPos.y === targetPixelY) {
                    isMoving = false;
                    // You could switch to an "idle" animation here if you have one
                }
            } else {
                // --- If not moving, check for new input ---
                let moved = false;
                let newDirection: Direction = currentDirection;

                // Note: Assuming positive Y axis is UP, adjust if it's DOWN
                if (keyboardInput.movementAxis.y > 0) {
                    y++; // Update the logical grid position
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
                    // A move was initiated, so lock input until it's finished
                    isMoving = true;
                    // This is the perfect place to add collision detection later!
                    // Before setting isMoving = true, check if the new (x, y) is a valid tile.

                    if (newDirection !== currentDirection) {
                        currentDirection = newDirection;

                        if (newDirection === Direction.UP) animator.play('walkUp');
                        if (newDirection === Direction.DOWN) animator.play('walkDown');
                        if (newDirection === Direction.LEFT) animator.play('walkLeft');
                        if (newDirection === Direction.RIGHT) animator.play('walkRight');
                    }
                }
            }
        }
    };
}

function getAnimator() {
    return createAnimator({
        spritesheets: {
            playerWalk: {
                src: PlayerWalk,
                rows: 4,
                cols: 6,
                padding: 17
            }
        },
        animations: {
            walkDown: {
                startingRow: 0,
                startingCol: 0,
                frames: 6,
                imageKey: 'playerWalk'
            },
            walkLeft: {
                startingRow: 1,
                startingCol: 0,
                frames: 6,
                imageKey: 'playerWalk'
            },
            walkRight: {
                startingRow: 2,
                startingCol: 0,
                frames: 6,
                imageKey: 'playerWalk'
            },
            walkUp: {
                startingRow: 3,
                startingCol: 0,
                frames: 6,
                imageKey: 'playerWalk'
            }
        },
        frameRate: 150
    }, true);
}
