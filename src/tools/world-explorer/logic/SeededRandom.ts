// Seeded random number generator using mulberry32 algorithm
// Provides deterministic random numbers from a seed

export interface SeededRandom {
    next: () => number;           // Returns 0 to 1
    nextInt: (max: number) => number;  // Returns 0 to max-1
    nextRange: (min: number, max: number) => number;  // Returns min to max
    nextBool: (probability?: number) => boolean;
    shuffle: <T>(array: T[]) => T[];
    pick: <T>(array: T[]) => T;
}

export function createSeededRandom(seed: number): SeededRandom {
    // Mulberry32 PRNG - fast and has good statistical properties
    let state = seed >>> 0;  // Ensure unsigned 32-bit

    function next(): number {
        state |= 0;
        state = (state + 0x6D2B79F5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    return {
        next,

        nextInt: (max) => Math.floor(next() * max),

        nextRange: (min, max) => min + next() * (max - min),

        nextBool: (probability = 0.5) => next() < probability,

        shuffle: <T>(array: T[]): T[] => {
            const result = [...array];
            for (let i = result.length - 1; i > 0; i--) {
                const j = Math.floor(next() * (i + 1));
                [result[i], result[j]] = [result[j], result[i]];
            }
            return result;
        },

        pick: <T>(array: T[]): T => array[Math.floor(next() * array.length)]
    };
}

// Hash a coordinate pair to get a deterministic seed
export function hashCoordinate(x: number, y: number, seed: number): number {
    // Simple spatial hash
    let hash = seed;
    hash = Math.imul(hash ^ (x | 0), 0x85ebca6b);
    hash = Math.imul(hash ^ (y | 0), 0xc2b2ae35);
    hash ^= hash >>> 16;
    return hash >>> 0;
}

// Hash a string to get a deterministic seed
export function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = Math.imul(hash ^ char, 0x5bd1e995);
        hash ^= hash >>> 15;
    }
    return hash >>> 0;
}
