import { Drawer } from "../../Drawer";
import { GameObject } from "../../GameWorld";
import { Box } from "../../Geometry";
import { createVector } from "../../Vector";

export const TILE_SIZE = 45;

export interface Tile extends GameObject {
    x: number;
    y: number;
    type: TileType;
}

export enum TileType {
    SELECTION, GRID, GRASS, TREE
}

export function createTile(drawer: Drawer, type: TileType): Tile {
    let x = 0;
    let y = 0;

    const box: Box = {
        position: createVector(0, 0),
        width: TILE_SIZE,
        height: TILE_SIZE,
        borderColor: type === TileType.SELECTION ? 'yellow' : 'white',
        borderWidth: type === TileType.SELECTION ? 2 : 1
    };

    return {
        get x() { return x; },
        set x(value: number) { x = value; },
        get y() { return y; },
        set y(value: number) { y = value; },

        type: type,

        draw: () => {
            const centerX = (x * TILE_SIZE) + (TILE_SIZE / 2);
            const centerY = (y * TILE_SIZE) + (TILE_SIZE / 2);

            box.position.set(centerX, centerY);

            drawer.draw(box);
        },

        update: (deltaTime) => { }
    };
}
