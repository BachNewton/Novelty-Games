export interface Point {
    x: number;
    y: number;
}

export interface Box {
    position: Point;
    width: number;
    height: number;
    color?: string | CanvasGradient | CanvasPattern
}
