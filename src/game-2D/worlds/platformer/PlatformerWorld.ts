import { GameWorld } from "../GameWorld";
import { Box } from "../Geometry";

export function createPlatformerWorld(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
): GameWorld {
    const obstacles: Box[] = [
        { x: 50, y: 300, width: 100, height: 20 },
        { x: 200, y: 250, width: 100, height: 20 },
        { x: 350, y: 200, width: 100, height: 20 },
        { x: 500, y: 150, width: 100, height: 20 },
        { x: 650, y: 100, width: 100, height: 20 }
    ];

    return {
        draw: () => {
            for (const obstacle of obstacles) {
                ctx.fillStyle = "brown";
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
        },
        update: (deltaTime) => {
            // TODO
        }
    };
}
