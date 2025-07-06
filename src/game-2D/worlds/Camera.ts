import { Box, Vector } from "./Geometry";

export interface Camera {
    position: Vector;
    centerOn: (target: Box) => void;
}

export function createCamera(): Camera {
    const position: Vector = { x: 0, y: 0 };

    return {
        position: position,
        centerOn: (target: Box) => {
            position.x = target.position.x + target.width / 2;
            position.y = target.position.y + target.height / 2;
        }
    };
}
