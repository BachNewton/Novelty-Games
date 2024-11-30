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
    x: boolean;
    y: boolean;
    b: boolean;
    view: boolean;
    leftStickIn: boolean;
    rightStickIn: boolean;
    leftDStick: boolean;
    rightDStick: boolean;
}
