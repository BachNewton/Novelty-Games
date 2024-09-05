export interface GameWorld {
    draw: () => void;
    update: (deltaTime: number) => void;
    onTouchStart: (e: TouchEvent) => void;
    onClick: (e: MouseEvent) => void;
}
