import { Rect } from "./Rect";

const BORDER_RADIUS = 15;
const SHADOW_BLUR = 15;

export function drawButton(ctx: CanvasRenderingContext2D, view: Rect) {
    ctx.save();

    ctx.fillStyle = '#3498db';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = SHADOW_BLUR;

    drawRoundedRect({ ctx, x: view.x, y: view.y, w: view.width, h: view.height, r: BORDER_RADIUS });

    ctx.restore();
}

interface RoundedRectParams {
    ctx: CanvasRenderingContext2D;
    x: number;
    y: number;
    w: number;
    h: number;
    r: number;
}

function drawRoundedRect({ ctx, x, y, w, h, r }: RoundedRectParams) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
}
