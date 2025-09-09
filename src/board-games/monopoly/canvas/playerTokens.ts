import { MonopolyState } from "../data/MonopolyState";
import { Rect } from "./Rect";

const PADDING = 5;

export function drawPlayerTokens(ctx: CanvasRenderingContext2D, view: Rect, state: MonopolyState, boardIndex: number) {
    const playersAtPosition = state.players.filter(p => p.position === boardIndex);
    const numPlayers = playersAtPosition.length;

    if (numPlayers === 0) return;

    const numColumns = numPlayers <= 1 ? 1 : 2;
    const numRows = Math.ceil(numPlayers / numColumns);

    const cellWidth = view.width / numColumns;
    const cellHeight = view.height / numRows;

    playersAtPosition.forEach((player, index) => {
        const col = index % numColumns;
        const row = Math.floor(index / numColumns);

        const x = view.x + (col * cellWidth) + (cellWidth / 2);
        const y = view.y + (row * cellHeight) + (cellHeight / 2);

        const radius = (Math.min(cellWidth, cellHeight) - (2 * PADDING)) / 2;

        ctx.beginPath();
        ctx.arc(x, y, Math.max(radius, 1), 0, 2 * Math.PI);
        ctx.fillStyle = player.color;
        ctx.fill();
    });
}
