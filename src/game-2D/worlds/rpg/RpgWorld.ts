import { Route, updateRoute } from "../../../ui/Routing";
import { Camera } from "../Camera";
import { GameWorld } from "../GameWorld";
import { getOverlay } from "./ui/Main";

const TILE_SIZE = 35;

export function createRpgWorld(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, camera: Camera): GameWorld {
    updateRoute(Route.RPG);

    return {
        draw: () => {
            const cols = Math.floor(canvas.width / TILE_SIZE) + 1;
            const rows = Math.floor(canvas.height / TILE_SIZE) + 1;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = 'white';
            ctx.lineWidth = 0.1;

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
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
            // throw new Error("Function not implemented.");
        },

        overlay: getOverlay()
    };
}
