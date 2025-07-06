export interface GameObject {
    draw(): void;
    update(deltaTime: number): void;
}

export interface GameWorld extends GameObject {
    mouseEvents?: MouseEvents;
    touchEvents?: TouchEvents;
}

export interface MouseEvents {
    onMouseDown?(x: number, y: number): void;
    onMouseMove?(x: number, y: number): void;
    onMouseUp?(x: number, y: number): void;
    onClick?(e: MouseEvent): void;
}

export interface TouchEvents {
    onTouchStart?(e: TouchEvent): void;
    onTouchEnd?(e: TouchEvent): void;
    onTouchMove?(e: TouchEvent): void;
}
