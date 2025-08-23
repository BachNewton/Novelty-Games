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
            const cols = Math.floor(canvas.width / TILE_SIZE) + 1;
            const rows = Math.floor(canvas.height / TILE_SIZE) + 1;

            ctx.strokeStyle = 'white';
            ctx.lineWidth = 0.1;

            for (let y = -1; y < rows; y++) {
                for (let x = -1; x < cols; x++) {
                    const screenX = x * TILE_SIZE - (camera.position.x % TILE_SIZE);
                    const screenY = y * TILE_SIZE - (camera.position.y % TILE_SIZE);

                    ctx.strokeRect(
                        screenX,
                        screenY,
                        TILE_SIZE,
                        TILE_SIZE
                    );
                }
            }
        },

        update: (deltaTime) => {
            camera.position.add(keyboardInput.movementAxis, deltaTime * CAMERA_SPEED);
        },

        overlay: getOverlay()
    };
}
