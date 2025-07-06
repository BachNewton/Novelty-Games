export interface Vector {
    x: number;
    y: number;
    add: (v: Vector, scalar?: number) => void;
}

export function createVector(initialX: number, initialY: number): Vector {
    let x = initialX;
    let y = initialY;

    return {
        get x() { return x; },
        set x(value: number) { x = value; },
        get y() { return y; },
        set y(value: number) { y = value; },
        add: (v, scalar) => {
            x += v.x * (scalar ?? 1);
            y += v.y * (scalar ?? 1);
        }
    };
}
