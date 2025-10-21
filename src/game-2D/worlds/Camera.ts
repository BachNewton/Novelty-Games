import { createVector, Vector } from "./Vector";

export interface Camera {
    position: Vector;
    mousePosition: Vector;
}

export function createCamera(canvas: HTMLCanvasElement): Camera {
    const position = createVector(0, 0);
    const mousePosition = createVector(0, 0);
    const clientPosition = createVector(0, 0);

    window.addEventListener('mousemove', e => {
        clientPosition.x = e.clientX;
        clientPosition.y = e.clientY;
    });

    return {
        position: position,

        get mousePosition() {
            updateMousePosition(canvas, mousePosition, clientPosition, position);

            return mousePosition;
        }
    };
}

function updateMousePosition(canvas: HTMLCanvasElement, mousePosition: Vector, clientPosition: Vector, position: Vector) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    mousePosition.x = clientPosition.x - centerX + position.x;
    mousePosition.y = centerY - clientPosition.y + position.y;
}
