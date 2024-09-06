import { Connection, LineSegment, Vector2D, Wiggler } from "./Data";

export function isTouching(x: number, y: number, wiggler: Wiggler): boolean {
    const distanceSquared = (x - wiggler.position.x) ** 2 + (y - wiggler.position.y) ** 2;
    return distanceSquared <= wiggler.size ** 2;
}

export function checkIntersection(a: Connection, b: Connection): boolean {
    const A = a.a.position;
    const B = a.b.position;
    const C = b.a.position;
    const D = b.b.position;

    return ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);
}

function ccw(A: Vector2D, B: Vector2D, C: Vector2D): boolean {
    return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
}

export function checkEachPair(connections: Array<Connection>, check: (a: Connection, b: Connection) => void): void {
    for (let i = 0; i < connections.length - 1; i++) {
        for (let j = i + 1; j < connections.length; j++) {
            check(connections[i], connections[j]);
        }
    }
}
