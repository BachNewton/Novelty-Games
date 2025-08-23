import { Route, updateRoute } from "../../../ui/Routing";
import { KeyboardInput } from "../../../util/input/Keyboard";
import { Camera } from "../Camera";
import { Drawer } from "../Drawer";
import { GameWorld } from "../GameWorld";
import { createTile, Tile, TILE_SIZE, TileType } from "./data/Tile";
import { getOverlay } from "./ui/Main";

const CAMERA_SPEED = 0.4;
const GRID_MINOR_WIDTH = 0.1;
const GRID_MAJOR_WIDTH = 0.25;

export function createRpgWorld(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    drawer: Drawer,
    keyboardInput: KeyboardInput
): GameWorld {
    updateRoute(Route.RPG);

    const tiles = new Map<string, Tile>();

    const selectedTile = createTile(drawer, TileType.SELECTION);
    const centerTile = createTile(drawer, TileType.GRID);

    let selectedTileType: TileType = TileType.GRASS;

    return {
        draw: () => {
            drawGrid(canvas, ctx, camera);

            for (const [, tile] of tiles) {
                tile.draw();
            }

            centerTile.draw();
            selectedTile.draw();
        },

        update: (deltaTime) => {
            camera.position.add(keyboardInput.movementAxis, deltaTime * CAMERA_SPEED);

            updateTileFromMousePosition(camera, selectedTile);
        },

        mouseEvents: {
            onClick: () => {
                console.log('Click');

                const tile = createTile(drawer, selectedTileType);
                updateTileFromMousePosition(camera, tile);
                tiles.set(`${tile.x},${tile.y}`, tile);
            }
        },

        overlay: getOverlay((type) => selectedTileType = type)
    };
}

function drawGrid(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, camera: Camera) {
    const worldStartX = camera.position.x - canvas.width / 2;
    const worldStartY = camera.position.y + canvas.height / 2;

    const firstGridX = -((worldStartX % TILE_SIZE) + TILE_SIZE) % TILE_SIZE;
    const firstGridY = ((worldStartY % TILE_SIZE) + TILE_SIZE) % TILE_SIZE;

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 0.25;

    ctx.beginPath();

    for (let x = firstGridX, i = Math.floor(worldStartX / TILE_SIZE); x < canvas.width; x += TILE_SIZE, i++) {
        ctx.beginPath();
        ctx.lineWidth = (i % 10 === 0) ? GRID_MAJOR_WIDTH : GRID_MINOR_WIDTH;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = firstGridY, j = Math.floor(worldStartY / TILE_SIZE); y < canvas.height; y += TILE_SIZE, j--) {
        ctx.beginPath();
        ctx.lineWidth = (j % 10 === 0) ? GRID_MAJOR_WIDTH : GRID_MINOR_WIDTH;
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    ctx.stroke();

    // drawGridNumbers(ctx, camera, canvas);
}

function drawGridNumbers(ctx: CanvasRenderingContext2D, camera: Camera, canvas: HTMLCanvasElement) {
    ctx.fillStyle = 'grey';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const minTileX = Math.floor((camera.position.x - canvas.width / 2) / TILE_SIZE);
    const maxTileX = Math.floor((camera.position.x + canvas.width / 2) / TILE_SIZE);
    const minTileY = Math.floor((camera.position.y - canvas.height / 2) / TILE_SIZE);
    const maxTileY = Math.floor((camera.position.y + canvas.height / 2) / TILE_SIZE);

    for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
        for (let tileY = minTileY; tileY <= maxTileY; tileY++) {
            const screenX = (tileX * TILE_SIZE) - (camera.position.x - canvas.width / 2) + TILE_SIZE / 2;
            const screenY = canvas.height - ((tileY * TILE_SIZE) - (camera.position.y - canvas.height / 2) + TILE_SIZE / 2);

            if (screenX >= 0 && screenX < canvas.width &&
                screenY >= 0 && screenY < canvas.height) {
                ctx.fillText(`${tileX}, ${tileY}`, screenX, screenY);
            }
        }
    }
}

function updateTileFromMousePosition(camera: Camera, tile: Tile) {
    const tileX = Math.floor(camera.mousePosition.x / TILE_SIZE);
    const tileY = Math.floor(camera.mousePosition.y / TILE_SIZE);

    tile.x = tileX;
    tile.y = tileY;
}
