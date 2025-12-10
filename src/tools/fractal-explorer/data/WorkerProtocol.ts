import { FractalType } from './FractalTypes';

export interface TileRequest {
    type: 'COMPUTE_TILE';
    tileId: string;
    tileX: number;
    tileY: number;
    tileWidth: number;
    tileHeight: number;
    // Complex plane bounds for this tile
    realMin: number;
    realMax: number;
    imagMin: number;
    imagMax: number;
    // Fractal parameters
    fractalType: FractalType;
    maxIterations: number;
    paletteId: string;
    // For Julia set
    juliaReal?: number;
    juliaImag?: number;
}

export interface TileResult {
    type: 'TILE_COMPLETE';
    tileId: string;
    workerId: number;
    imageData: number[];
    tileWidth: number;
    tileHeight: number;
    computeTimeMs: number;
}

export interface WorkerInit {
    type: 'INIT';
    workerId: number;
}

export type WorkerMessage = TileRequest | WorkerInit;
export type WorkerResponse = TileResult;
