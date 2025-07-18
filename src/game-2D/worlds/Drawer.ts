import { Camera } from "./Camera";
import { Box } from "./Geometry";

export interface Drawer {
    draw(box: Box): void;
}

export function createDrawer(ctx: CanvasRenderingContext2D, camera: Camera): Drawer {
    const canvas = ctx.canvas;

    return {
        draw: (box) => {
            const canvasCenterX = canvas.width / 2;
            const canvasCenterY = canvas.height / 2;

            const boxScreenCenterX = box.position.x - camera.position.x + canvasCenterX;
            const boxScreenCenterY = canvasCenterY - (box.position.y - camera.position.y);

            const drawX = boxScreenCenterX - (box.width / 2);
            const drawY = boxScreenCenterY - (box.height / 2);

            ctx.fillStyle = box.color ?? 'magenta';
            ctx.fillRect(drawX, drawY, box.width, box.height);
        }
    };
}
