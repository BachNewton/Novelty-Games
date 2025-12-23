import { FractalType } from './FractalTypes';

export interface TourStop {
    id: string;
    name: string;
    description: string;
    real: string;
    imag: string;
    zoom: number;
}

export interface Tour {
    id: string;
    name: string;
    description: string;
    fractalType: FractalType;
    stops: TourStop[];
}

export const MANDELBROT_TOUR: Tour = {
    id: 'mandelbrot-journey',
    name: 'Mandelbrot Journey',
    description: 'A mathematical adventure through the infinite complexity of the Mandelbrot set',
    fractalType: 'mandelbrot',
    stops: [
        {
            id: 'overview',
            name: 'The Full Set',
            description: 'The complete Mandelbrot set - a cardioid with an infinite boundary of bulbs and filaments',
            real: '-0.5',
            imag: '0',
            zoom: 250
        },
        {
            id: 'seahorse-valley',
            name: 'Seahorse Valley',
            description: 'The narrow gap between the main cardioid and the largest bulb, filled with spiraling seahorse-like shapes',
            real: '-0.75',
            imag: '0.1',
            zoom: 2000
        },
        {
            id: 'seahorse-tail',
            name: 'Seahorse Tail',
            description: 'Deep into the spiraling tendrils where self-similar patterns emerge at every scale',
            real: '-0.7463',
            imag: '0.1102',
            zoom: 50000
        },
        {
            id: 'elephant-valley',
            name: 'Elephant Valley',
            description: 'Named for its trunk-like spiral formations that curl endlessly into the boundary',
            real: '0.27205',
            imag: '0.00612',
            zoom: 3000
        },
        {
            id: 'elephant-deep',
            name: 'Elephant Deep',
            description: 'Venturing deeper into the elephant spirals reveals increasingly intricate patterns',
            real: '0.272172',
            imag: '0.005725',
            zoom: 5e6
        },
        {
            id: 'deep-spiral',
            name: 'Deep Spiral',
            description: 'At this depth, we enter CPU rendering territory - each frame takes longer but reveals stunning detail',
            real: '-0.7436439',
            imag: '0.1318259',
            zoom: 5e8
        },
        {
            id: 'hidden-minibrot',
            name: 'Hidden Minibrot',
            description: 'A tiny copy of the entire Mandelbrot set, hidden deep within the boundary - proof of infinite self-similarity',
            real: '-1.749024499891772',
            imag: '0.0',
            zoom: 1e12
        },
        {
            id: 'infinite-depth',
            name: 'Infinite Depth',
            description: 'At 10^17 magnification, we need arbitrary-precision arithmetic. The patterns continue forever...',
            real: '-0.7436438870371587',
            imag: '0.1318259042053119',
            zoom: 1e17
        }
    ]
};

export const ALL_TOURS: Tour[] = [MANDELBROT_TOUR];

export function getTourById(id: string): Tour | undefined {
    return ALL_TOURS.find(tour => tour.id === id);
}
