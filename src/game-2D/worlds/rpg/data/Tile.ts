import { Drawer } from "../../Drawer";
import { GameObject } from "../../GameWorld";
import { Box } from "../../Geometry";
import { createVector } from "../../Vector";

export const TILE_SIZE = {
    current: 100,
    MAX: 300,
    MIN: 20
};

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
        get width() { return TILE_SIZE.current; },
        get height() { return TILE_SIZE.current; },
        color: getTileColor(type),
        borderColor: getTileBorderColor(type),
        borderWidth: getTileBorderWidth(type)
    };

    return {
        get x() { return x; },
        set x(value: number) { x = value; },
        get y() { return y; },
        set y(value: number) { y = value; },

        type: type,

        draw: () => {
            const { centerX, centerY } = tileLocationToPosition(x, y);

            box.position.set(centerX, centerY);

            drawer.draw(box);
        },

        update: (deltaTime) => { }
    };
}

export function tileLocationToPosition(x: number, y: number): { centerX: number, centerY: number } {
    return {
        centerX: (x * TILE_SIZE.current) + (TILE_SIZE.current / 2),
        centerY: (y * TILE_SIZE.current) + (TILE_SIZE.current / 2)
    };
}

function getTileBorderColor(type: TileType): string | undefined {
    switch (type) {
        case TileType.SELECTION: return 'yellow';
        case TileType.GRID: return 'white';
        default: return undefined;
    }
}

function getTileBorderWidth(type: TileType): number | undefined {
    switch (type) {
        case TileType.SELECTION: return 2;
        case TileType.GRID: return 1;
        default: return undefined;
    }
}

function getTileColor(type: TileType): string | undefined {
    switch (type) {
        case TileType.GRASS: return 'green';
        case TileType.TREE: return 'brown';
        default: return undefined;
    }
}
