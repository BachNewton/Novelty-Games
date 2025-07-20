export function coerceToRange(num: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, num));
}

export function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export function toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}
