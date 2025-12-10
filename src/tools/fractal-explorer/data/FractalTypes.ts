export type FractalType = 'mandelbrot' | 'julia' | 'burningShip' | 'tricorn';

export interface FractalConfig {
    type: FractalType;
    name: string;
    description: string;
    defaultCenter: { real: number; imag: number };
    defaultZoom: number;
    // For Julia set, the C parameter
    juliaC?: { real: number; imag: number };
}

export const FRACTAL_CONFIGS: Record<FractalType, FractalConfig> = {
    mandelbrot: {
        type: 'mandelbrot',
        name: 'Mandelbrot Set',
        description: 'The classic fractal: z = z² + c',
        defaultCenter: { real: -0.5, imag: 0 },
        defaultZoom: 250
    },
    julia: {
        type: 'julia',
        name: 'Julia Set',
        description: 'z = z² + c with fixed c parameter',
        defaultCenter: { real: 0, imag: 0 },
        defaultZoom: 250,
        juliaC: { real: -0.7, imag: 0.27015 }
    },
    burningShip: {
        type: 'burningShip',
        name: 'Burning Ship',
        description: 'z = (|Re(z)| + i|Im(z)|)² + c',
        defaultCenter: { real: -0.4, imag: -0.5 },
        defaultZoom: 250
    },
    tricorn: {
        type: 'tricorn',
        name: 'Tricorn',
        description: 'z = conj(z)² + c (Mandelbar)',
        defaultCenter: { real: -0.3, imag: 0 },
        defaultZoom: 250
    }
};

// Algorithm implementations for use in workers (as strings for Blob URL)
export const FRACTAL_ALGORITHMS = `
function computeMandelbrot(cr, ci, maxIter) {
    let zr = 0, zi = 0;
    for (let i = 0; i < maxIter; i++) {
        const zr2 = zr * zr;
        const zi2 = zi * zi;
        if (zr2 + zi2 > 4) return i;
        zi = 2 * zr * zi + ci;
        zr = zr2 - zi2 + cr;
    }
    return maxIter;
}

function computeJulia(zr, zi, cr, ci, maxIter) {
    for (let i = 0; i < maxIter; i++) {
        const zr2 = zr * zr;
        const zi2 = zi * zi;
        if (zr2 + zi2 > 4) return i;
        const newZi = 2 * zr * zi + ci;
        zr = zr2 - zi2 + cr;
        zi = newZi;
    }
    return maxIter;
}

function computeBurningShip(cr, ci, maxIter) {
    let zr = 0, zi = 0;
    for (let i = 0; i < maxIter; i++) {
        const zr2 = zr * zr;
        const zi2 = zi * zi;
        if (zr2 + zi2 > 4) return i;
        zi = Math.abs(2 * zr * zi) + ci;
        zr = zr2 - zi2 + cr;
    }
    return maxIter;
}

function computeTricorn(cr, ci, maxIter) {
    let zr = 0, zi = 0;
    for (let i = 0; i < maxIter; i++) {
        const zr2 = zr * zr;
        const zi2 = zi * zi;
        if (zr2 + zi2 > 4) return i;
        // Conjugate: use -zi instead of zi
        const newZi = -2 * zr * zi + ci;
        zr = zr2 - zi2 + cr;
        zi = newZi;
    }
    return maxIter;
}

function computeFractal(type, pr, pi, cr, ci, maxIter) {
    switch (type) {
        case 'mandelbrot':
            return computeMandelbrot(pr, pi, maxIter);
        case 'julia':
            return computeJulia(pr, pi, cr, ci, maxIter);
        case 'burningShip':
            return computeBurningShip(pr, pi, maxIter);
        case 'tricorn':
            return computeTricorn(pr, pi, maxIter);
        default:
            return computeMandelbrot(pr, pi, maxIter);
    }
}
`;
