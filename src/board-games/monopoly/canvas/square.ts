import { Rect } from "./Rect";

export function drawSquare(ctx: CanvasRenderingContext2D, view: Rect) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(view.x, view.y, view.width, view.height);

    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(view.x.toFixed(1), view.x + (view.width / 2), view.y + (view.height / 2));
}
