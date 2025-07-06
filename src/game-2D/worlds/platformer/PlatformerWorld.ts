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

export function createPlatformerWorld(drawer: Drawer, camera: Camera, keyboardInput: KeyboardInput): GameWorld {
    updateRoute(Route.PLATFORMER);

    const gravity = createVector(0, GRAVITY);

    const obstacles: Box[] = [
        { position: createVector(-500, 250), width: 1000, height: 100, color: 'grey' },
        { position: createVector(200, 50), width: 250, height: 50, color: 'grey' }
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

            for (const obstacle of obstacles) {
                if (isColliding(player, obstacle) && resolveCollision(player, obstacle, FRICTION) === NormalDirection.UP) {
                    player.updateIsOnGround(true);
                }
            }

            camera.centerOn(player);
        }
    };
}
