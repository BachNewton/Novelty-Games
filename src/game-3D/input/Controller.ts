export interface Controller {
    leftAxis: Axis;
    rightAxis: Axis;
    pressed: Buttons;
    update(): void;
}

export interface Axis {
    x: number;
    y: number;
}

export interface Buttons {
    a: boolean;
    view: boolean;
    rightStickIn: boolean;
}
