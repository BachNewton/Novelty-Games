import { Route, updateRoute } from "../../../ui/Routing";
import { KeyboardInput } from "../../../util/input/Keyboard";
import { Camera } from "../Camera";
import { Drawer } from "../Drawer";
import { GameWorld } from "../GameWorld";
import { createTile, Tile, TILE_SIZE } from "./data/Tile";
import { getOverlay } from "./ui/Main";

const CAMERA_SPEED = 0.25;

export function createRpgWorld(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    drawer: Drawer,
    keyboardInput: KeyboardInput
): GameWorld {
    updateRoute(Route.RPG);

    const selectedTile = createTile(drawer, true);
    const centerTile = createTile(drawer, false);

    return {
        draw: () => {
            centerTile.draw();
            selectedTile.draw();
        },

        update: (deltaTime) => {
            camera.position.add(keyboardInput.movementAxis, deltaTime * CAMERA_SPEED);

            updateSelectedTile(camera, selectedTile);
        },

        overlay: getOverlay()
    };
}

function updateSelectedTile(camera: Camera, selectedTile: Tile) {
    const tileX = Math.floor(camera.mousePosition.x / TILE_SIZE);
    const tileY = Math.floor(camera.mousePosition.y / TILE_SIZE);

    selectedTile.x = tileX;
    selectedTile.y = tileY;
}
