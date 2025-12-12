import { FractalType } from '../data/FractalTypes';

export interface RenderParams {
    centerReal: number;
    centerImag: number;
    zoom: number;
    maxIterations: number;
    fractalType: FractalType;
    paletteId: string;
    juliaReal: number;
    juliaImag: number;
}

export interface ArbitraryPrecisionRenderParams extends RenderParams {
    centerRealStr: string;
    centerImagStr: string;
    zoomStr: string;
}

export type RenderMode = 'gpu' | 'cpu';

export interface RenderProgress {
    mode: RenderMode;
    percentComplete: number;
    currentPass: number;
    totalPasses: number;
}

export interface FractalRenderer {
    resize: (width: number, height: number) => void;
    render: (params: RenderParams | ArbitraryPrecisionRenderParams) => void;
    dispose: () => void;
    getMode: () => RenderMode;
    onProgress?: (callback: (progress: RenderProgress) => void) => void;
    cancelRender?: () => void;
}
