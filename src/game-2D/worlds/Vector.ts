export interface Vector {
    x: number;
    y: number;
    add: (v: Vector, scalar?: number) => void;
    copy: (v: Vector) => void;
}

export function createVector(initialX: number, initialY: number): Vector {
    let x = initialX;
    let y = initialY;

    return {
        get x() { return x; },
        set x(value: number) { x = value; },
        get y() { return y; },
        set y(value: number) { y = value; },
        add: (v, scalar = 1) => {
            x += v.x * scalar;
            y += v.y * scalar;
        },
        copy: (v) => {
            x = v.x;
            y = v.y;
        }
    };
}
