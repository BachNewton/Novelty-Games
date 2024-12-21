export interface ToddlerServerData {
    type: 'object' | 'clear';
}

export interface ToddlerServerObjectData extends ToddlerServerData {
    type: 'object'
    shape: Shape;
    color: Color;
}

export interface ToddlerServerClearData extends ToddlerServerData {
    type: 'clear';
}

export enum Shape {
    SPHERE, BOX
}

export enum Color {
    RED, BLUE, GREEN, YELLOW, PURPLE, ORANGE
}
