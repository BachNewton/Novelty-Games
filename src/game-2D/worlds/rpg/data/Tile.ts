import { Drawer } from "../../Drawer";
import { GameObject } from "../../GameWorld";
import { Box } from "../../Geometry";
import { createVector } from "../../Vector";

export const TILE_SIZE = 40;

export interface Tile extends GameObject {
    x: number;
    y: number;
}

export function createTile(drawer: Drawer, isHighlight: boolean): Tile {
    let x = 0;
    let y = 0;

    const box: Box = {
        position: createVector(0, 0),
        width: TILE_SIZE,
        height: TILE_SIZE,
        borderColor: isHighlight ? 'yellow' : 'white',
        borderWidth: isHighlight ? 4 : 1
    };

    return {
        get x() { return x; },
        set x(value: number) { x = value; },
        get y() { return y; },
        set y(value: number) { y = value; },

        draw: () => {
            const centerX = (x * TILE_SIZE) + (TILE_SIZE / 2);
            const centerY = (y * TILE_SIZE) + (TILE_SIZE / 2);

            box.position.set(centerX, centerY);

            drawer.draw(box);
        },

        update: (deltaTime) => { }
    };
}
