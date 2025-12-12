import { FractalType } from '../data/FractalTypes';

// Messages from Coordinator to Worker
export type CoordinatorMessage =
    | InitMessage
    | ComputePixelsMessage
    | StopMessage;

export interface InitMessage {
    type: 'INIT';
    workerId: number;
}

export interface ComputePixelsMessage {
    type: 'COMPUTE_PIXELS';
    // Unique ID for this render request (to discard stale results)
    renderId: number;
    // Canvas dimensions
    canvasWidth: number;
    canvasHeight: number;
    // Pixel coordinates to compute (flat array: [x0, y0, x1, y1, ...])
    pixels: number[];
    // Fractal parameters - all as strings for arbitrary precision
    centerRealStr: string;
    centerImagStr: string;
    zoomStr: string;
    maxIterations: number;
    fractalType: FractalType;
    juliaRealStr: string;
    juliaImagStr: string;
    // Pass info for progress reporting
    passNumber: number;
    totalPasses: number;
}

export interface StopMessage {
    type: 'STOP';
}

// Messages from Worker to Coordinator
export type WorkerMessage =
    | ReadyMessage
    | PixelsResultMessage
    | ProgressMessage;

export interface ReadyMessage {
    type: 'READY';
    workerId: number;
}

export interface PixelsResultMessage {
    type: 'PIXELS_RESULT';
    workerId: number;
    renderId: number;
    // Pixel data with escape magnitude for smooth coloring
    // Format: [x0, y0, iter0, mag0, x1, y1, iter1, mag1, ...]
    // mag = escape magnitude (zr² + zi²) when escaped, 0 for points in set
    results: number[];
    passNumber: number;
    computeTimeMs: number;
}

export interface ProgressMessage {
    type: 'PROGRESS';
    workerId: number;
    renderId: number;
    pixelsCompleted: number;
    totalPixels: number;
    passNumber: number;
}
