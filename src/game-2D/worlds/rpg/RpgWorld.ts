import { Route, updateRoute } from "../../../ui/Routing";
import { KeyboardInput } from "../../../util/input/Keyboard";
import { Camera } from "../Camera";
import { Drawer } from "../Drawer";
import { GameWorld } from "../GameWorld";
import { Box } from "../Geometry";
import { createVector } from "../Vector";
import { getOverlay } from "./ui/Main";

const TILE_SIZE = 35;
const CAMERA_SPEED = 0.25;

export function createRpgWorld(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    drawer: Drawer,
    keyboardInput: KeyboardInput
): GameWorld {
    updateRoute(Route.RPG);

    const selectedCell: Box = {
        position: createVector(0, 0),
        width: TILE_SIZE,
        height: TILE_SIZE,
        borderColor: 'yellow',
        borderWidth: 2
    };

    const centerBox: Box = {
        position: createVector(0, 0),
        width: TILE_SIZE,
        height: TILE_SIZE,
        borderColor: 'white',
        borderWidth: 1
    };

    return {
        draw: () => {
            drawer.draw(centerBox);
            drawer.draw(selectedCell);
        },

        update: (deltaTime) => {
            camera.position.add(keyboardInput.movementAxis, deltaTime * CAMERA_SPEED);

            const tileX = Math.floor(camera.mousePosition.x / TILE_SIZE);
            const tileY = Math.floor(camera.mousePosition.y / TILE_SIZE);

            const centerX = (tileX * TILE_SIZE) + (TILE_SIZE / 2);
            const centerY = (tileY * TILE_SIZE) + (TILE_SIZE / 2);

            selectedCell.position.set(centerX, centerY);

            // console.log(camera.position.x, camera.position.y);
            // console.log(keyboardInput.movementAxis);
            // console.log(camera.mousePosition.x, camera.mousePosition.y);
            // console.log(tileX, tileY);
        },

        overlay: getOverlay()
    };
}
