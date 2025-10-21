import { MonopolyIcons } from "../data/MonopolyIcons";
import { MonopolyState } from "../data/MonopolyState";
import { Rect } from "./Rect";
import { drawSquare } from "./square";

const SQUARE_PER_SIDE = 11;

export function drawBoard(ctx: CanvasRenderingContext2D, view: Rect, state: MonopolyState, icons: MonopolyIcons): { centerView: Rect } {
    ctx.strokeStyle = 'white';

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
        }, boardIndex++, state, icons);
    }

    // Left side
    for (let i = 1; i < SQUARE_PER_SIDE; i++) {
        const y = view.y + (SQUARE_PER_SIDE - 1 - i) * height;

        drawSquare(ctx, {
            x: view.x,
            y: y,
            width: width,
            height: height
        }, boardIndex++, state, icons);
    }

    // Top side
    for (let i = 1; i < SQUARE_PER_SIDE; i++) {
        const x = view.x + i * width;

        drawSquare(ctx, {
            x: x,
            y: view.y,
            width: width,
            height: height
        }, boardIndex++, state, icons);
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
        }, boardIndex++, state, icons);
    }

    return {
        centerView: {
            x: view.x + width + 1,
            y: view.y + height + 1,
            width: view.width - (width * 2) - 2,
            height: view.height - (height * 2) - 2
        }
    };
}
