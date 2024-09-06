import { Connection, LineSegment, Vector2D, Wiggler } from "./Data";

export function isTouching(x: number, y: number, wiggler: Wiggler): boolean {
    const distanceSquared = (x - wiggler.position.x) ** 2 + (y - wiggler.position.y) ** 2;
    return distanceSquared <= wiggler.size ** 2;
}

export function OLD_checkIntersection(a: Connection, b: Connection): boolean {
    const L1: LineSegment = { start: a.a.position, end: a.b.position };
    const L2: LineSegment = { start: b.a.position, end: b.b.position };

    return OLD_ccw(L1.start, L2.start, L2.end) * OLD_ccw(L1.end, L2.start, L2.end) <= 0 &&
        OLD_ccw(L2.start, L1.start, L1.end) * OLD_ccw(L2.end, L1.start, L1.end) <= 0;
}

function OLD_ccw(A: Vector2D, B: Vector2D, C: Vector2D): number {
    return (C.y - A.y) * (B.x - A.x) - (B.y - A.y) * (C.x - A.x);
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

export function checkEachPair<T>(array: T[], check: (a: T, b: T) => void): void {
    // for (let i = 0; i < array.length - 1; i++) {
    //     for (let j = i + 1; j < array.length; j++) {
    //         check(array[i], array[j]);
    //     }
    // }

    for (const a of array) {
        for (const b of array) {
            if (a === b) continue;

            check(a, b);
        }
    }
}
