export interface Vector {
    x: number;
    y: number;
}

export interface Box {
    position: Vector;
    width: number;
    height: number;
    color?: string | CanvasGradient | CanvasPattern
}

export function isColliding(a: Box, b: Box): boolean {
    return (
        a.position.x < b.position.x + b.width &&
        a.position.x + a.width > b.position.x &&
        a.position.y < b.position.y + b.height &&
        a.position.y + a.height > b.position.y
    );
}

