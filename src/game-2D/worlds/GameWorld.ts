export interface GameWorld {
    draw(): void;
    update(deltaTime: number): void;
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
