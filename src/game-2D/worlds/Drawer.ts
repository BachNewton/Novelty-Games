import { Box } from "./Geometry";

export interface Drawer {
    draw(box: Box): void;
}

export function createDrawer(ctx: CanvasRenderingContext2D): Drawer {
    return {
        draw: (box: Box) => {
            ctx.fillStyle = box.color ?? 'magenta';
            ctx.fillRect(box.position.x, box.position.y, box.width, box.height);
        }
    };
}
