import { Camera } from "./Camera";
import { Box } from "./Geometry";

export interface Drawer {
    draw(box: Box): void;
}

export function createDrawer(ctx: CanvasRenderingContext2D, camera: Camera): Drawer {
    const canvas = ctx.canvas;

    return {
        draw: (box: Box) => {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            const x = box.position.x - camera.position.x + centerX;
            const y = box.position.y - camera.position.y + centerY;

            ctx.fillStyle = box.color ?? 'magenta';

            ctx.fillRect(x, y, box.width, box.height);
        }
    };
}
