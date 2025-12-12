import { createFile, FileType } from "../../../util/File";
import { KeyboardInput } from "../../../util/input/Keyboard";
import { MouseInput, MouseScroll } from "../../../util/input/Mouse";
import { Camera } from "../Camera";
import { Drawer } from "../Drawer";
import { GameWorld } from "../GameWorld";
import { createTile, Tile, TileType, TILE_SIZE } from "./data/Tile";
import { getOverlay } from "./ui/Main";
import TestZone from "./zone/test.json";
import { createPlayer } from "./Player";

const CAMERA_SPEED = 0.4;
const GRID_MINOR_WIDTH = 0.1;
const GRID_MAJOR_WIDTH = 0.3;

export function createRpgWorld(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    drawer: Drawer,
    keyboardInput: KeyboardInput,
    mouseInput: MouseInput
): GameWorld {
    const tiles = new Map<string, Tile>();

    TestZone.forEach(t => {
        const tile = createTile(drawer, t.type);

        tile.x = t.x;
        tile.y = t.y;

        tiles.set(getKey(tile), tile);
    });

    const selectedTile = createTile(drawer, TileType.SELECTION);
    const centerTile = createTile(drawer, TileType.GRID);

    let selectedTileType: TileType = TileType.GRASS;
    let isMouseOverPannel = false;

    const player = createPlayer(drawer, keyboardInput, mouseInput);

    mouseInput.addScrollListener(scroll => {
        if (scroll === MouseScroll.UP) {
            TILE_SIZE.current = Math.min(TILE_SIZE.current + 1, TILE_SIZE.MAX);
        } else {
            TILE_SIZE.current = Math.max(TILE_SIZE.current - 1, TILE_SIZE.MIN);
        }
    });

    const onSave = () => {
        const zone = Array.from(tiles).map(([, tile]) => tile);
        createFile(FileType.JSON, 'zone', JSON.stringify(zone));
    };

    return {
        draw: () => {
            drawGrid(canvas, ctx, camera);

            for (const [, tile] of tiles) {
                tile.draw();
            }

            centerTile.draw();
            selectedTile.draw();
            player.draw();
        },

        update: (deltaTime) => {
            camera.position.add(keyboardInput.movementAxis, deltaTime * CAMERA_SPEED);

            updateTileFromMousePosition(camera, selectedTile);

            if (!isMouseOverPannel && (mouseInput.held.Left || mouseInput.held.Right)) {
                const tile = createTile(drawer, selectedTileType);
                updateTileFromMousePosition(camera, tile);
                const key = getKey(tile);

                if (mouseInput.held.Left) {
                    tiles.set(key, tile);
                } else if (mouseInput.held.Right) {
                    tiles.delete(key);
                }
            }

            player.update(deltaTime);
        },

        overlay: getOverlay(
            (type) => selectedTileType = type,
            onSave,
            isOverPannel => isMouseOverPannel = isOverPannel
        )
    };
}

function drawGrid(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, camera: Camera) {
    const worldStartX = camera.position.x - canvas.width / 2;
    const worldStartY = camera.position.y + canvas.height / 2;

    const firstGridX = -((worldStartX % TILE_SIZE.current) + TILE_SIZE.current) % TILE_SIZE.current;
    const firstGridY = ((worldStartY % TILE_SIZE.current) + TILE_SIZE.current) % TILE_SIZE.current;

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 0.25;

    ctx.beginPath();

    for (let x = firstGridX, i = Math.floor(worldStartX / TILE_SIZE.current); x < canvas.width; x += TILE_SIZE.current, i++) {
        ctx.beginPath();
        ctx.lineWidth = (i % 10 === 0) ? GRID_MAJOR_WIDTH : GRID_MINOR_WIDTH;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = firstGridY, j = Math.floor(worldStartY / TILE_SIZE.current); y < canvas.height; y += TILE_SIZE.current, j--) {
        ctx.beginPath();
        ctx.lineWidth = (j % 10 === 0) ? GRID_MAJOR_WIDTH : GRID_MINOR_WIDTH;
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    ctx.stroke();

    // drawGridNumbers(ctx, camera, canvas);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function drawGridNumbers(ctx: CanvasRenderingContext2D, camera: Camera, canvas: HTMLCanvasElement) {
    ctx.fillStyle = 'grey';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const minTileX = Math.floor((camera.position.x - canvas.width / 2) / TILE_SIZE.current);
    const maxTileX = Math.floor((camera.position.x + canvas.width / 2) / TILE_SIZE.current);
    const minTileY = Math.floor((camera.position.y - canvas.height / 2) / TILE_SIZE.current);
    const maxTileY = Math.floor((camera.position.y + canvas.height / 2) / TILE_SIZE.current);

    for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
        for (let tileY = minTileY; tileY <= maxTileY; tileY++) {
            const screenX = (tileX * TILE_SIZE.current) - (camera.position.x - canvas.width / 2) + TILE_SIZE.current / 2;
            const screenY = canvas.height - ((tileY * TILE_SIZE.current) - (camera.position.y - canvas.height / 2) + TILE_SIZE.current / 2);

            if (screenX >= 0 && screenX < canvas.width &&
                screenY >= 0 && screenY < canvas.height) {
                ctx.fillText(`${tileX}, ${tileY}`, screenX, screenY);
            }
        }
    }
}

function updateTileFromMousePosition(camera: Camera, tile: Tile) {
    const tileX = Math.floor(camera.mousePosition.x / TILE_SIZE.current);
    const tileY = Math.floor(camera.mousePosition.y / TILE_SIZE.current);

    tile.x = tileX;
    tile.y = tileY;
}

function getKey(tile: Tile): string {
    return `${tile.x},${tile.y}`;
}
