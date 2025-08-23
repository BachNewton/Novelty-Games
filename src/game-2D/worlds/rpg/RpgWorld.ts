import { Route, updateRoute } from "../../../ui/Routing";
import { KeyboardInput } from "../../../util/input/Keyboard";
import { Camera } from "../Camera";
import { GameWorld } from "../GameWorld";
import { getOverlay } from "./ui/Main";

const TILE_SIZE = 35;
const CAMERA_SPEED = 0.25;

export function createRpgWorld(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    keyboardInput: KeyboardInput
): GameWorld {
    updateRoute(Route.RPG);

    return {
        draw: () => {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;

            ctx.strokeRect(
                camera.mousePosition.x - TILE_SIZE / 2,
                camera.mousePosition.y - TILE_SIZE / 2,
                TILE_SIZE,
                TILE_SIZE
            );
        },

        update: (deltaTime) => {
            camera.position.add(keyboardInput.movementAxis, deltaTime * CAMERA_SPEED);
            // console.log(camera.position.x, camera.position.y);
            // console.log(keyboardInput.movementAxis);
        },

        overlay: getOverlay()
    };
}
