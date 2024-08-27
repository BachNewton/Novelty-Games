export interface Box {
    pos: Position;
    previousPos: Position;
    width: number;
    height: number;
    angle: number;
    color: string;
    speed: number;
    hitColor: string | null;
    isPerfect: boolean | null;
};

export interface Ring {
    pos: Position;
    radius: number;
}

export interface Position {
    x: number;
    y: number;
}
