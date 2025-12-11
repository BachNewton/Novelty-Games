export interface SpiralCoordinate {
    x: number;
    y: number;
}

/**
 * Converts a natural number to its position in the Ulam spiral.
 * The spiral starts at 1 in the center and winds outward counter-clockwise:
 *
 *  17-16-15-14-13
 *   |           |
 *  18  5--4--3 12
 *   |  |     |  |
 *  19  6  1--2 11
 *   |  |        |
 *  20  7--8--9-10
 *   |
 *  21-22-23-24-25...
 */
export function numberToSpiralPosition(n: number): SpiralCoordinate {
    if (n === 1) return { x: 0, y: 0 };

    // Find which "ring" the number is in
    // Ring k contains numbers from (2k-1)^2 + 1 to (2k+1)^2
    const k = Math.ceil((Math.sqrt(n) - 1) / 2);
    const ringMax = (2 * k + 1) * (2 * k + 1);
    const sideLength = 2 * k;

    // Position within the ring (0 to ringSize-1, starting from bottom-right going counter-clockwise)
    let posInRing = ringMax - n;

    // Determine which side and position on that side
    const side = Math.floor(posInRing / sideLength);
    const posOnSide = posInRing % sideLength;

    switch (side) {
        case 0: // Right side (going up)
            return { x: k, y: -k + posOnSide };
        case 1: // Top side (going left)
            return { x: k - posOnSide, y: k };
        case 2: // Left side (going down)
            return { x: -k, y: k - posOnSide };
        case 3: // Bottom side (going right)
            return { x: -k + posOnSide, y: -k };
        default:
            return { x: 0, y: 0 };
    }
}

/**
 * Get the bounding box needed to display numbers up to maxNumber
 */
export function getSpiralBounds(maxNumber: number): { minX: number; maxX: number; minY: number; maxY: number } {
    const k = Math.ceil((Math.sqrt(maxNumber) - 1) / 2);
    return {
        minX: -k,
        maxX: k,
        minY: -k,
        maxY: k
    };
}

/**
 * Batch convert numbers to spiral positions for efficient rendering
 */
export function numbersToSpiralPositions(numbers: number[]): Map<number, SpiralCoordinate> {
    const positions = new Map<number, SpiralCoordinate>();
    for (const n of numbers) {
        positions.set(n, numberToSpiralPosition(n));
    }
    return positions;
}
