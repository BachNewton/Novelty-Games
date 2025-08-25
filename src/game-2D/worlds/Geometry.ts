import { AnimationFrame } from "./Animator";
import { Vector } from "./Vector";

export interface Box {
    position: Vector;
    width: number;
    height: number;
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    getAnimationFrame?: () => AnimationFrame | null;
}

export interface MovingBox extends Box {
    velocity: Vector;
}

export function isColliding(a: Box, b: Box): boolean {
    return (
        Math.abs(a.position.x - b.position.x) < (a.width / 2 + b.width / 2) &&
        Math.abs(a.position.y - b.position.y) < (a.height / 2 + b.height / 2)
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
    const dx = a.position.x - b.position.x;
    const dy = a.position.y - b.position.y;

    const combinedHalfWidths = a.width / 2 + b.width / 2;
    const combinedHalfHeights = a.height / 2 + b.height / 2;

    const overlapX = combinedHalfWidths - Math.abs(dx);
    const overlapY = combinedHalfHeights - Math.abs(dy);

    let direction: NormalDirection;

    if (overlapX < overlapY) {
        if (dx > 0) {
            a.position.x += overlapX;
            direction = NormalDirection.RIGHT;
        } else {
            a.position.x -= overlapX;
            direction = NormalDirection.LEFT;
        }
        a.velocity.x = 0;
        a.velocity.y *= 1 - friction;
    } else {
        if (dy > 0) {
            a.position.y += overlapY;
            direction = NormalDirection.UP;
        } else {
            a.position.y -= overlapY;
            direction = NormalDirection.DOWN;
        }
        a.velocity.y = 0;
        a.velocity.x *= 1 - friction;
    }

    return direction;
}
