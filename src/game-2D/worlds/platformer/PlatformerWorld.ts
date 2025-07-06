import { GameWorld } from "../GameWorld";

export function createPlatformerWorld(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
): GameWorld {
    return {
        draw: () => {
            throw new Error("Function not implemented.");
        },
        update: (deltaTime) => {
            throw new Error("Function not implemented.");
        }
    };
}
