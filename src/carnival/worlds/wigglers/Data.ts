export interface Wiggler {
    position: Vector2D;
    size: number;
}

export interface Connection {
    a: Wiggler;
    b: Wiggler;
    isUninterrupted?: boolean;
}

export function createWiggler(position: Vector2D): Wiggler {
    return {
        position: position,
        size: 0.0325
    };
}

export interface HeldWiggler {
    wiggler: Wiggler;
    offset: Vector2D;
}

export interface Vector2D {
    x: number;
    y: number;
}

export interface LineSegment {
    start: Vector2D;
    end: Vector2D;
}
