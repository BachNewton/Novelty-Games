export interface GameWorld {
    draw(): void;
    update(deltaTime: number): void;
    onTouchStart(e: TouchEvent): void;
    onTouchEnd(e: TouchEvent): void;
    onTouchMove(e: TouchEvent): void;
    onClick(e: MouseEvent): void;
    onMouseDown(x: number, y: number): void;
    onMouseMove(x: number, y: number): void;
    onMouseUp(x: number, y: number): void;
}
