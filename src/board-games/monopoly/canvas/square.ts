import { MonopolyIcons } from "../data/MonopolyIcons";
import { MonopolyState } from "../data/MonopolyState";
import { Street } from "../data/Square";
import { Rect } from "./Rect";

const STREET_COLOR_SIZE = 1 / 5;

export function drawSquare(ctx: CanvasRenderingContext2D, view: Rect, boardIndex: number, state: MonopolyState, icons: MonopolyIcons) {
    const square = state.board[boardIndex];

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(view.x, view.y, view.width, view.height);

    if (square.type === 'street') {
        drawStreet(ctx, view, square, boardIndex);
    } else if (square.type === 'community-chest') {
        drawIcon(ctx, view, icons.communityChest);
    } else if (square.type === 'tax') {
        drawIcon(ctx, view, icons.tax);
    } else if (square.type === 'chance') {
        drawIcon(ctx, view, icons.chance);
    } else if (square.type === 'electric-utility') {
        drawIcon(ctx, view, icons.electricUtility);
    } else if (square.type === 'water-utility') {
        drawIcon(ctx, view, icons.waterUtility);
    } else if (square.type === 'railroad') {
        drawIcon(ctx, view, icons.railroad);
    } else if (square.type === 'go') {
        drawIcon(ctx, view, icons.go);
    } else if (square.type === 'jail') {
        drawIcon(ctx, view, icons.jail);
    } else if (square.type === 'free-parking') {
        drawIcon(ctx, view, icons.freeParking);
    } else if (square.type === 'go-to-jail') {
        drawIcon(ctx, view, icons.goToJail);
    }

    ctx.font = '15px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // ctx.fillText(boardIndex.toString(), view.x + (view.width / 2), view.y + (view.height / 2));
}

function drawStreet(ctx: CanvasRenderingContext2D, view: Rect, square: Street, boardIndex: number) {
    const side = getSide(boardIndex);

    ctx.fillStyle = square.color;

    if (side === 'bottom') {
        ctx.fillRect(view.x + 1, view.y + 1, view.width - 2, view.height * STREET_COLOR_SIZE);
    } else if (side === 'left') {
        ctx.fillRect((view.x + view.width) - (view.width * STREET_COLOR_SIZE) - 1, view.y + 1, view.width * STREET_COLOR_SIZE, view.height - 2);
    } else if (side === 'top') {
        ctx.fillRect(view.x + 1, (view.y + view.height) - (view.height * STREET_COLOR_SIZE) - 1, view.width - 2, view.height * STREET_COLOR_SIZE);
    } else if (side === 'right') {
        ctx.fillRect(view.x + 1, view.y + 1, view.width * STREET_COLOR_SIZE, view.height - 2);
    }
}

function getSide(index: number): 'bottom' | 'left' | 'top' | 'right' {
    if (index >= 0 && index <= 10) return 'bottom';
    if (index >= 11 && index <= 19) return 'left';
    if (index >= 20 && index <= 30) return 'top';
    if (index >= 31 && index <= 39) return 'right';
    throw new Error('Invalid index');
}

function drawIcon(ctx: CanvasRenderingContext2D, view: Rect, icon: HTMLImageElement) {
    const size = Math.min(view.width, view.height);
    const x = view.x + (view.width / 2) - (size / 2);
    const y = view.y + (view.height / 2) - (size / 2);

    ctx.drawImage(icon, x, y, size, size);
}
