export interface Wiggler {
    position: Vector2D;
    size: number;
    connections: Array<Wiggler>;
}

export function createWiggler(position: Vector2D): Wiggler {
    return {
        position: position,
        size: 0.025,
        connections: []
    };
}

export interface HeldWiggler {
    wiggler: Wiggler;
    offset: Vector2D;
}

interface Vector2D {
    x: number;
    y: number;
}
