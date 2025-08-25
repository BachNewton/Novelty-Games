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

            drawAnimation(box, ctx, drawX, drawY);
            drawColor(box, ctx, drawX, drawY);
            drawBorder(box, ctx, drawX, drawY);
        }
    };
}

function drawAnimation(box: Box, ctx: CanvasRenderingContext2D, drawX: number, drawY: number) {
    const frame = box.getAnimationFrame?.() ?? null;

    if (frame === null) return;

    ctx.drawImage(
        frame.image,
        frame.x,
        frame.y,
        frame.width,
        frame.height,
        drawX,
        drawY,
        box.width,
        box.height
    );

    if (frame.debug) {
        ctx.strokeStyle = 'magenta';
        ctx.lineWidth = 1;

        ctx.strokeRect(
            drawX,
            drawY,
            box.width,
            box.height
        );
    }
}

function drawColor(box: Box, ctx: CanvasRenderingContext2D, drawX: number, drawY: number) {
    if (box.color === undefined) return;

    const color = box.color;

    ctx.fillStyle = color;

    ctx.fillRect(drawX, drawY, box.width, box.height);
}

function drawBorder(box: Box, ctx: CanvasRenderingContext2D, drawX: number, drawY: number) {
    if (box.borderColor === undefined) return;

    const borderColor = box.borderColor;
    const borderWidth = box.borderWidth ?? 1;

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;

    ctx.strokeRect(
        drawX,
        drawY,
        box.width,
        box.height
    );
}
