export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function isPointInRect({ x, y }: { x: number, y: number }, rect?: Rect): boolean {
    if (rect === undefined) return false;

    const isXInBounds = x >= rect.x && x <= rect.x + rect.width;
    const isYInBounds = y >= rect.y && y <= rect.y + rect.height;

    return isXInBounds && isYInBounds;
}
