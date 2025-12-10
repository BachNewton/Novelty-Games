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
