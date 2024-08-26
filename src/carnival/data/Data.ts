export interface Box {
    pos: Position;
    width: number;
    height: number;
    angle: number;
    color: string;
    speed: number;
};

export interface Ring {
    pos: Position;
    radius: number;
}

interface Position {
    x: number;
    y: number;
}
