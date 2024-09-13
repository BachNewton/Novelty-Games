import { Connection, LineSegment, Vector2D, Wiggler } from "./Data";

const SHORTENING_SCALE_FACTOR = 0.99;

export function isTouching(x: number, y: number, wiggler: Wiggler): boolean {
    const distanceSquared = (x - wiggler.position.x) ** 2 + (y - wiggler.position.y) ** 2;
    return distanceSquared <= wiggler.size ** 2;
}

export function checkIntersection(a: Connection, b: Connection): boolean {
    const shortenedA = shortenFromCenter({ start: a.a.position, end: a.b.position });
    const shortenedB = shortenFromCenter({ start: b.a.position, end: b.b.position });

    const A = shortenedA.start;
    const B = shortenedA.end;
    const C = shortenedB.start;
    const D = shortenedB.end;

    return ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);
}

function ccw(A: Vector2D, B: Vector2D, C: Vector2D): boolean {
    return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
}

function shortenFromCenter(lineSegment: LineSegment): LineSegment {
    const center = {
        x: (lineSegment.start.x + lineSegment.end.x) / 2,
        y: (lineSegment.start.y + lineSegment.end.y) / 2
    };

    return {
        start: {
            x: center.x + (lineSegment.start.x - center.x) * SHORTENING_SCALE_FACTOR,
            y: center.y + (lineSegment.start.y - center.y) * SHORTENING_SCALE_FACTOR
        },
        end: {
            x: center.x + (lineSegment.end.x - center.x) * SHORTENING_SCALE_FACTOR,
            y: center.y + (lineSegment.end.y - center.y) * SHORTENING_SCALE_FACTOR
        }
    };
}

export function checkEachPair(connections: Array<Connection>, check: (a: Connection, b: Connection) => void): void {
    for (let i = 0; i < connections.length - 1; i++) {
        for (let j = i + 1; j < connections.length; j++) {
            check(connections[i], connections[j]);
        }
    }
}
