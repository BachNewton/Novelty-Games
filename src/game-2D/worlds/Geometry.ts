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

export function resolveCollision(a: Box, b: Box) {
    const overlapX = Math.min(a.position.x + a.width - b.position.x, b.position.x + b.width - a.position.x);
    const overlapY = Math.min(a.position.y + a.height - b.position.y, b.position.y + b.height - a.position.y);

    if (overlapX < overlapY) {
        if (a.position.x < b.position.x) {
            a.position.x -= overlapX;
        } else {
            a.position.x += overlapX;
        }
    } else {
        if (a.position.y < b.position.y) {
            a.position.y -= overlapY;
        } else {
            a.position.y += overlapY;
        }
    }
}
