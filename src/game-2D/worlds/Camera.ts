import { Box } from "./Geometry";
import { createVector, Vector } from "./Vector";

export interface Camera {
    position: Vector;
    mousePosition: Vector;
    centerOn: (target: Box) => void;
}

export function createCamera(ctx: CanvasRenderingContext2D): Camera {
    const canvas = ctx.canvas;
    const position = createVector(0, 0);
    const mousePosition = createVector(0, 0);

    window.addEventListener('mousemove', (e) => {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        mousePosition.x = e.clientX - centerX + position.x;
        mousePosition.y = centerY - e.clientY + position.y;
    });

    return {
        position: position,
        get mousePosition() {
            return mousePosition;
        },
        centerOn: (target: Box) => {
            position.x = target.position.x;
            position.y = target.position.y;
        }
    };
}
