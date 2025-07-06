import { Vector } from "./Vector";

export interface Box {
    position: Vector;
    width: number;
    height: number;
    color?: string | CanvasGradient | CanvasPattern
}

export interface MovingBox extends Box {
    velocity: Vector;
}

export function isColliding(a: Box, b: Box): boolean {
    return (
        a.position.x < b.position.x + b.width &&
        a.position.x + a.width > b.position.x &&
        a.position.y < b.position.y + b.height &&
        a.position.y + a.height > b.position.y
    );
}

export enum NormalDirection {
    UP, DOWN, LEFT, RIGHT
}

/**
 * @param friction
 * A value between 0 and 1 representing the friction applied to the velocity after collision resolution.
 * 0 is no friction, 1 is full friction.
 */
export function resolveCollision(a: MovingBox, b: Box, friction: number = 0): NormalDirection {
    const overlapX = Math.min(a.position.x + a.width - b.position.x, b.position.x + b.width - a.position.x);
    const overlapY = Math.min(a.position.y + a.height - b.position.y, b.position.y + b.height - a.position.y);

    let direction: NormalDirection;

    if (overlapX < overlapY) {
        if (a.position.x < b.position.x) {
            a.position.x -= overlapX;
            direction = NormalDirection.LEFT;
        } else {
            a.position.x += overlapX;
            direction = NormalDirection.RIGHT;
        }

        a.velocity.x = 0;
        a.velocity.y *= 1 - friction;
    } else {
        if (a.position.y < b.position.y) {
            a.position.y -= overlapY;
            direction = NormalDirection.UP;
        } else {
            a.position.y += overlapY;
            direction = NormalDirection.DOWN;
        }

        a.velocity.y = 0;
        a.velocity.x *= 1 - friction;
    }

    return direction;
}
