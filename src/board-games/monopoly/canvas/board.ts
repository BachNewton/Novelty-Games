import { MonopolyState } from "../data/MonopolyState";
import { Rect } from "./Rect";
import { drawSquare } from "./square";

const LINE_WIDTH = 2;
const SQUARE_PER_SIDE = 11;

export function drawBoard(ctx: CanvasRenderingContext2D, view: Rect, state: MonopolyState): void {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = LINE_WIDTH;

    const width = view.width / SQUARE_PER_SIDE;
    const height = view.height / SQUARE_PER_SIDE;

    let boardIndex = 0;

    // Bottom side
    for (let i = 0; i < SQUARE_PER_SIDE; i++) {
        const x = view.x + (SQUARE_PER_SIDE - 1 - i) * width;

        drawSquare(ctx, {
            x: x,
            y: view.y + view.height - height,
            width: width,
            height: height
        }, boardIndex++, state);
    }

    // Left side
    for (let i = 1; i < SQUARE_PER_SIDE; i++) {
        const y = view.y + (SQUARE_PER_SIDE - 1 - i) * height;

        drawSquare(ctx, {
            x: view.x,
            y: y,
            width: width,
            height: height
        }, boardIndex++, state);
    }

    // Top side
    for (let i = 1; i < SQUARE_PER_SIDE; i++) {
        const x = view.x + i * width;

        drawSquare(ctx, {
            x: x,
            y: view.y,
            width: width,
            height: height
        }, boardIndex++, state);
    }

    // Right side
    for (let i = 1; i < SQUARE_PER_SIDE - 1; i++) {
        const x = view.x + view.width - width;
        const y = view.y + i * height;

        drawSquare(ctx, {
            x: x,
            y: y,
            width: width,
            height: height
        }, boardIndex++, state);
    }
}
