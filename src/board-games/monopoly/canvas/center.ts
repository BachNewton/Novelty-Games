import { MonopolyState } from "../data/MonopolyState";
import { drawButton } from "./button";
import { Rect } from "./Rect";

const PADDING = 10;
const BUTTON_SIZE = 75;

export function drawCenter(ctx: CanvasRenderingContext2D, view: Rect, state: MonopolyState): void {
    ctx.fillStyle = 'green';
    ctx.fillRect(view.x, view.y, view.width, view.height);

    if (state.phase.type === 'buy-property') {
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Buy ${state.phase.property.name} for $${state.phase.property.price}?`, view.x + view.width / 2, view.y + view.height / 2);

        const bottomLeftView: Rect = {
            x: view.x + PADDING,
            y: view.y + view.height - BUTTON_SIZE - PADDING,
            width: BUTTON_SIZE,
            height: BUTTON_SIZE
        };

        const bottomRightView: Rect = {
            x: view.x + view.width - BUTTON_SIZE - PADDING,
            y: view.y + view.height - BUTTON_SIZE - PADDING,
            width: BUTTON_SIZE,
            height: BUTTON_SIZE
        };

        drawButton(ctx, bottomLeftView);
        drawButton(ctx, bottomRightView);
    }
}
