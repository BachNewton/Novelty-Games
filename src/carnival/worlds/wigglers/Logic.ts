import { LineSegment, Vector2D, Wiggler } from "./Data";

export function isTouching(x: number, y: number, wiggler: Wiggler): boolean {
    const distanceSquared = (x - wiggler.position.x) ** 2 + (y - wiggler.position.y) ** 2;
    return distanceSquared <= wiggler.size ** 2;
}

export function isIntersection(L1: LineSegment, L2: LineSegment): boolean {
    return ccw(L1.start, L2.start, L2.end) * ccw(L1.end, L2.start, L2.end) <= 0 &&
        ccw(L2.start, L1.start, L1.end) * ccw(L2.end, L1.start, L1.end) <= 0;
}

function ccw(A: Vector2D, B: Vector2D, C: Vector2D): number {
    return (C.y - A.y) * (B.x - A.x) - (B.y - A.y) * (C.x - A.x);
}
