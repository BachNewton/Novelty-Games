import { Route, updateRoute } from "../../../ui/Routing";
import { createFile, FileType } from "../../../util/File";
import { KeyboardInput } from "../../../util/input/Keyboard";
import { MouseInput } from "../../../util/input/Mouse";
import { Camera } from "../Camera";
import { Drawer } from "../Drawer";
import { GameWorld } from "../GameWorld";
import { createTile, Tile, TILE_SIZE, TileType } from "./data/Tile";
import { getOverlay } from "./ui/Main";
import TestZone from "./zone/test.json";
import PlayerWalk from "./sprites/player_walk.png";
import { Box } from "../Geometry";
import { createVector } from "../Vector";
import { createAnimator } from "../Animator";

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
    updateRoute(Route.RPG);

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

    const animator = createAnimator({
        imageSrc: PlayerWalk,
        rows: 4,
        cols: 6,
        animations: {
            walkDown: {
                startingRow: 0,
                startingCol: 0,
                frames: 6
            },
            walkLeft: {
                startingRow: 1,
                startingCol: 0,
                frames: 6
            },
            walkRight: {
                startingRow: 2,
                startingCol: 0,
                frames: 6
            },
            walkUp: {
                startingRow: 3,
                startingCol: 0,
                frames: 6
            }
        },
        frameRate: 250,
        padding: 17
    }, true);

    animator.play('walkDown');

    const player: Box = {
        position: createVector(0, 0),
        width: 800,
        height: 800,
        getAnimationFrame: animator.getFrame
    };

    const onSave = () => {
        const zone = Array.from(tiles).map(([, tile]) => tile);
        createFile(FileType.JSON, 'zone', JSON.stringify(zone));
    };

    return {
        draw: () => {
            drawGrid(canvas, ctx, camera);

            // for (const [, tile] of tiles) {
            //     tile.draw();
            // }

            centerTile.draw();
            selectedTile.draw();

            drawer.draw(player);
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

            // player.animation?.update(deltaTime);
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

function getKey(tile: Tile): string {
    return `${tile.x},${tile.y}`;
}
