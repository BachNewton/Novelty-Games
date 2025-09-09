import { Rect } from "./Rect";
import { drawSquare } from "./square";

const LINE_WIDTH = 2;
const SQUARE_PER_SIDE = 11;

export function drawBoard(ctx: CanvasRenderingContext2D, view: Rect): void {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = LINE_WIDTH;

    const width = view.width / SQUARE_PER_SIDE;
    const height = view.height / SQUARE_PER_SIDE;

    for (let i = 0; i < SQUARE_PER_SIDE; i++) {
        const x = view.x + i * width;

        drawSquare(ctx, {
            x,
            y: view.height - height,
            width,
            height
        });
    }
}
