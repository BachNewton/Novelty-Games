import { MonopolyState } from "../data/MonopolyState";
import { Rect } from "./Rect";

export function drawCenter(ctx: CanvasRenderingContext2D, view: Rect, state: MonopolyState): void {
    ctx.fillStyle = 'green';
    ctx.fillRect(view.x, view.y, view.width, view.height);

    if (state.phase.type === 'buy-property') {
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Buy ${state.phase.property.name} for $${state.phase.property.price}?`, view.x + view.width / 2, view.y + view.height / 2);
    }
}
