export interface Wiggler {
    position: Point;
    size: number;
    connections: Array<Wiggler>;
}

export function createWiggler(position: Point): Wiggler {
    return {
        position: position,
        size: 0.025,
        connections: []
    };
}

interface Point {
    x: number;
    y: number;
}
