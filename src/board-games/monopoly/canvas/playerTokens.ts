import { MonopolyState } from "../data/MonopolyState";
import { Rect } from "./Rect";

const PADDING_SCALE = 0.75;

export function drawPlayerTokens(ctx: CanvasRenderingContext2D, view: Rect, state: MonopolyState, boardIndex: number) {
    const paddedWidth = view.width * PADDING_SCALE;
    const paddedHeight = view.height * PADDING_SCALE;

    const paddedX = view.x + (view.width - paddedWidth) / 2;
    const paddedY = view.y + (view.height - paddedHeight) / 2;

    const paddedView: Rect = {
        x: paddedX,
        y: paddedY,
        width: paddedWidth,
        height: paddedHeight
    };

    const playersAtPosition = state.players.filter(p => p.position === boardIndex);
    const numPlayers = playersAtPosition.length;

    if (numPlayers === 0) return;

    const numColumns = numPlayers <= 1 ? 1 : 2;
    const numRows = Math.ceil(numPlayers / numColumns);

    const cellWidth = paddedView.width / numColumns;
    const cellHeight = paddedView.height / numRows;

    playersAtPosition.forEach((player, index) => {
        const col = index % numColumns;
        const row = Math.floor(index / numColumns);

        const x = paddedView.x + (col * cellWidth) + (cellWidth / 2);
        const y = paddedView.y + (row * cellHeight) + (cellHeight / 2);

        const radius = Math.min(cellWidth, cellHeight) / 2;

        ctx.beginPath();
        ctx.arc(x, y, Math.max(radius, 1), 0, 2 * Math.PI);
        ctx.fillStyle = player.color;
        ctx.fill();
    });
}
