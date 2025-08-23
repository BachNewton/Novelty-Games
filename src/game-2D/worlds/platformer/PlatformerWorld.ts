import { Route, updateRoute } from "../../../ui/Routing";
import { KeyboardInput } from "../../../util/input/Keyboard";
import { Camera } from "../Camera";
import { Drawer } from "../Drawer";
import { GameWorld } from "../GameWorld";
import { Box, isColliding, NormalDirection, resolveCollision } from "../Geometry";
import { createVector } from "../Vector";
import { createPlayer } from "./Player";

const GRAVITY = 0.01;
const FRICTION = 0.1;

export function createPlatformerWorld(
    drawer: Drawer,
    camera: Camera,
    keyboardInput: KeyboardInput
): GameWorld {
    updateRoute(Route.PLATFORMER);

    const gravity = createVector(0, -GRAVITY);

    const obstacles: Box[] = [
        { position: createVector(0, -200), width: 1000, height: 100, color: 'grey' },
        { position: createVector(250, 0), width: 300, height: 100, color: 'grey' },
        { position: createVector(-250, 0), width: 300, height: 100, color: 'grey' },
        { position: createVector(300, 200), width: 150, height: 50, color: 'yellow' },
        { position: createVector(-300, 200), width: 150, height: 50, color: 'orange' }
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

            player.applyAcceleration(gravity);

            player.updateIsOnGround(false);
            for (const obstacle of obstacles) {
                if (isColliding(player, obstacle) && resolveCollision(player, obstacle, FRICTION) === NormalDirection.UP) {
                    player.updateIsOnGround(true);
                }
            }

            camera.position.copy(player.position);
        },
        mouseEvents: {
            onMouseDown: () => {
                obstacles.push({ position: createVector(camera.mousePosition.x, camera.mousePosition.y), width: 20, height: 20, });
            }
        }
    };
}
