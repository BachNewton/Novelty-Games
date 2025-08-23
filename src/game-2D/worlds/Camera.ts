import { Box } from "./Geometry";
import { createVector, Vector } from "./Vector";

export interface Camera {
    position: Readonly<Vector>;
    mousePosition: Readonly<Vector>;
    centerOn: (target: Box) => void;
}

export function createCamera(canvas: HTMLCanvasElement): Camera {
    const position = createVector(0, 0);
    const mousePosition = createVector(0, 0);
    const clientPosition = createVector(0, 0);

    window.addEventListener('mousemove', e => {
        clientPosition.x = e.clientX;
        clientPosition.y = e.clientY;

        updateMousePosition(canvas, mousePosition, clientPosition, position);
    });

    return {
        position: position,
        mousePosition: mousePosition,
        centerOn: (target: Box) => {
            position.x = target.position.x;
            position.y = target.position.y;

            updateMousePosition(canvas, mousePosition, clientPosition, position);
        }
    };
}
function updateMousePosition(canvas: HTMLCanvasElement, mousePosition: Vector, clientPosition: Vector, position: Vector) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    mousePosition.x = clientPosition.x - centerX + position.x;
    mousePosition.y = centerY - clientPosition.y + position.y;
}
