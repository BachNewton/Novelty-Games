// Simplex noise implementation for terrain generation
// Based on Stefan Gustavson's implementation

import { createSeededRandom } from './SeededRandom';

export interface NoiseGenerator {
    noise2D: (x: number, y: number) => number;
    octaveNoise2D: (x: number, y: number, octaves: number, persistence: number, lacunarity: number) => number;
    ridgedNoise2D: (x: number, y: number, octaves: number, persistence: number, lacunarity: number) => number;
}

// Gradient vectors for 2D simplex noise
const GRAD3: [number, number][] = [
    [1, 1], [-1, 1], [1, -1], [-1, -1],
    [1, 0], [-1, 0], [0, 1], [0, -1]
];

// Skewing factors for 2D
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

export function createNoiseGenerator(seed: number): NoiseGenerator {
    // Generate permutation table from seed
    const rng = createSeededRandom(seed);
    const perm: number[] = [];
    const permMod8: number[] = [];

    // Initialize with values 0-255
    for (let i = 0; i < 256; i++) {
        perm[i] = i;
    }

    // Shuffle using seeded RNG
    for (let i = 255; i > 0; i--) {
        const j = rng.nextInt(i + 1);
        [perm[i], perm[j]] = [perm[j], perm[i]];
    }

    // Extend to 512 for wrapping
    for (let i = 0; i < 512; i++) {
        perm[i] = perm[i & 255];
        permMod8[i] = perm[i] & 7;
    }

    function dot2(gx: number, gy: number, x: number, y: number): number {
        return gx * x + gy * y;
    }

    function noise2D(x: number, y: number): number {
        // Skew input space
        const s = (x + y) * F2;
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);

        // Unskew back
        const t = (i + j) * G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = x - X0;
        const y0 = y - Y0;

        // Determine which simplex we're in
        let i1: number, j1: number;
        if (x0 > y0) {
            i1 = 1;
            j1 = 0;
        } else {
            i1 = 0;
            j1 = 1;
        }

        // Offsets for corners
        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1 + 2 * G2;
        const y2 = y0 - 1 + 2 * G2;

        // Hash coordinates
        const ii = i & 255;
        const jj = j & 255;

        // Calculate contributions from corners
        let n0 = 0, n1 = 0, n2 = 0;

        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) {
            t0 *= t0;
            const gi0 = permMod8[ii + perm[jj]];
            const [gx0, gy0] = GRAD3[gi0];
            n0 = t0 * t0 * dot2(gx0, gy0, x0, y0);
        }

        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) {
            t1 *= t1;
            const gi1 = permMod8[ii + i1 + perm[jj + j1]];
            const [gx1, gy1] = GRAD3[gi1];
            n1 = t1 * t1 * dot2(gx1, gy1, x1, y1);
        }

        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) {
            t2 *= t2;
            const gi2 = permMod8[ii + 1 + perm[jj + 1]];
            const [gx2, gy2] = GRAD3[gi2];
            n2 = t2 * t2 * dot2(gx2, gy2, x2, y2);
        }

        // Scale to [-1, 1]
        return 70 * (n0 + n1 + n2);
    }

    function octaveNoise2D(
        x: number,
        y: number,
        octaves: number,
        persistence: number,
        lacunarity: number
    ): number {
        let total = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += noise2D(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }

        return total / maxValue;
    }

    function ridgedNoise2D(
        x: number,
        y: number,
        octaves: number,
        persistence: number,
        lacunarity: number
    ): number {
        let total = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            // Ridged noise: take absolute value and invert
            const n = 1 - Math.abs(noise2D(x * frequency, y * frequency));
            total += n * n * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }

        return total / maxValue;
    }

    return {
        noise2D,
        octaveNoise2D,
        ridgedNoise2D
    };
}
