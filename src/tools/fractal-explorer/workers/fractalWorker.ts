import Decimal from 'decimal.js';
import { CoordinatorMessage, WorkerMessage, ComputePixelsMessage } from './FractalWorkerMessages';
import { FractalType } from '../data/FractalTypes';

/* eslint-disable no-restricted-globals */
const ctx: Worker = self as unknown as Worker;
let workerId = -1;

// Cached precision to avoid redundant configuration
let cachedZoomStr: string | null = null;

// Configure Decimal.js for arbitrary precision (only when zoom changes)
function configurePrecisionIfNeeded(zoomStr: string): void {
    if (zoomStr === cachedZoomStr) return;

    cachedZoomStr = zoomStr;
    const zoom = new Decimal(zoomStr);
    // Calculate needed precision: roughly log10(zoom) * 1.5 + buffer
    const zoomDigits = zoom.abs().log(10).toNumber();
    const neededPrecision = Math.max(30, Math.ceil(zoomDigits * 1.5) + 20);
    Decimal.set({ precision: neededPrecision });
}

// Threshold for using fast float mode (64-bit float has 53-bit mantissa ≈ 9e15 precision)
// Set conservatively below observed artifact threshold (~3e16)
const FLOAT_PRECISION_THRESHOLD = 1e16;

// Result type for smooth coloring support
interface FractalResult {
    iter: number;
    mag: number;  // Escape magnitude (zr² + zi²), 0 for points in set
}

// ==================== FAST FLOAT IMPLEMENTATIONS ====================
// These use native JavaScript numbers for 10-100x speedup at moderate zoom levels

function computeMandelbrotFloat(cReal: number, cImag: number, maxIterations: number): FractalResult {
    let zr = 0;
    let zi = 0;
    let zr2 = 0;
    let zi2 = 0;

    for (let i = 0; i < maxIterations; i++) {
        if (zr2 + zi2 > 4) {
            return { iter: i, mag: zr2 + zi2 };
        }

        zi = 2 * zr * zi + cImag;
        zr = zr2 - zi2 + cReal;
        zr2 = zr * zr;
        zi2 = zi * zi;
    }

    return { iter: maxIterations, mag: 0 };
}

function computeJuliaFloat(
    zReal: number,
    zImag: number,
    cReal: number,
    cImag: number,
    maxIterations: number
): FractalResult {
    let zr = zReal;
    let zi = zImag;
    let zr2 = zr * zr;
    let zi2 = zi * zi;

    for (let i = 0; i < maxIterations; i++) {
        if (zr2 + zi2 > 4) {
            return { iter: i, mag: zr2 + zi2 };
        }

        zi = 2 * zr * zi + cImag;
        zr = zr2 - zi2 + cReal;
        zr2 = zr * zr;
        zi2 = zi * zi;
    }

    return { iter: maxIterations, mag: 0 };
}

function computeBurningShipFloat(cReal: number, cImag: number, maxIterations: number): FractalResult {
    let zr = 0;
    let zi = 0;
    let zr2 = 0;
    let zi2 = 0;

    for (let i = 0; i < maxIterations; i++) {
        if (zr2 + zi2 > 4) {
            return { iter: i, mag: zr2 + zi2 };
        }

        const absZr = Math.abs(zr);
        const absZi = Math.abs(zi);
        zi = 2 * absZr * absZi + cImag;
        zr = zr2 - zi2 + cReal;
        zr2 = zr * zr;
        zi2 = zi * zi;
    }

    return { iter: maxIterations, mag: 0 };
}

function computeTricornFloat(cReal: number, cImag: number, maxIterations: number): FractalResult {
    let zr = 0;
    let zi = 0;
    let zr2 = 0;
    let zi2 = 0;

    for (let i = 0; i < maxIterations; i++) {
        if (zr2 + zi2 > 4) {
            return { iter: i, mag: zr2 + zi2 };
        }

        zi = -2 * zr * zi + cImag;
        zr = zr2 - zi2 + cReal;
        zr2 = zr * zr;
        zi2 = zi * zi;
    }

    return { iter: maxIterations, mag: 0 };
}

function computePixelFloat(
    pixelX: number,
    pixelY: number,
    canvasWidth: number,
    canvasHeight: number,
    centerReal: number,
    centerImag: number,
    zoom: number,
    maxIterations: number,
    fractalType: FractalType,
    juliaReal: number,
    juliaImag: number
): FractalResult {
    const real = centerReal + (pixelX - canvasWidth / 2) / zoom;
    const imag = centerImag + (canvasHeight / 2 - pixelY) / zoom;

    switch (fractalType) {
        case 'mandelbrot':
            return computeMandelbrotFloat(real, imag, maxIterations);
        case 'julia':
            return computeJuliaFloat(real, imag, juliaReal, juliaImag, maxIterations);
        case 'burningShip':
            return computeBurningShipFloat(real, imag, maxIterations);
        case 'tricorn':
            return computeTricornFloat(real, imag, maxIterations);
        default:
            return computeMandelbrotFloat(real, imag, maxIterations);
    }
}

// ==================== ARBITRARY PRECISION IMPLEMENTATIONS ====================

function computeMandelbrot(
    cReal: Decimal,
    cImag: Decimal,
    maxIterations: number
): FractalResult {
    let zr = new Decimal(0);
    let zi = new Decimal(0);
    let zr2 = new Decimal(0);
    let zi2 = new Decimal(0);
    const four = new Decimal(4);

    for (let i = 0; i < maxIterations; i++) {
        const mag = zr2.plus(zi2);
        if (mag.gt(four)) {
            return { iter: i, mag: mag.toNumber() };
        }

        zi = zr.times(zi).times(2).plus(cImag);
        zr = zr2.minus(zi2).plus(cReal);
        zr2 = zr.times(zr);
        zi2 = zi.times(zi);
    }

    return { iter: maxIterations, mag: 0 };
}

function computeJulia(
    zReal: Decimal,
    zImag: Decimal,
    cReal: Decimal,
    cImag: Decimal,
    maxIterations: number
): FractalResult {
    let zr = zReal;
    let zi = zImag;
    let zr2 = zr.times(zr);
    let zi2 = zi.times(zi);
    const four = new Decimal(4);

    for (let i = 0; i < maxIterations; i++) {
        const mag = zr2.plus(zi2);
        if (mag.gt(four)) {
            return { iter: i, mag: mag.toNumber() };
        }

        zi = zr.times(zi).times(2).plus(cImag);
        zr = zr2.minus(zi2).plus(cReal);
        zr2 = zr.times(zr);
        zi2 = zi.times(zi);
    }

    return { iter: maxIterations, mag: 0 };
}

function computeBurningShip(
    cReal: Decimal,
    cImag: Decimal,
    maxIterations: number
): FractalResult {
    let zr = new Decimal(0);
    let zi = new Decimal(0);
    let zr2 = new Decimal(0);
    let zi2 = new Decimal(0);
    const four = new Decimal(4);

    for (let i = 0; i < maxIterations; i++) {
        const mag = zr2.plus(zi2);
        if (mag.gt(four)) {
            return { iter: i, mag: mag.toNumber() };
        }

        // Burning Ship uses absolute values
        const absZr = zr.abs();
        const absZi = zi.abs();
        zi = absZr.times(absZi).times(2).plus(cImag);
        zr = zr2.minus(zi2).plus(cReal);
        zr2 = zr.times(zr);
        zi2 = zi.times(zi);
    }

    return { iter: maxIterations, mag: 0 };
}

function computeTricorn(
    cReal: Decimal,
    cImag: Decimal,
    maxIterations: number
): FractalResult {
    let zr = new Decimal(0);
    let zi = new Decimal(0);
    let zr2 = new Decimal(0);
    let zi2 = new Decimal(0);
    const four = new Decimal(4);

    for (let i = 0; i < maxIterations; i++) {
        const mag = zr2.plus(zi2);
        if (mag.gt(four)) {
            return { iter: i, mag: mag.toNumber() };
        }

        // Tricorn: conjugate z (negate imaginary in multiplication)
        zi = zr.times(zi).times(-2).plus(cImag);
        zr = zr2.minus(zi2).plus(cReal);
        zr2 = zr.times(zr);
        zi2 = zi.times(zi);
    }

    return { iter: maxIterations, mag: 0 };
}

function computePixel(
    pixelX: number,
    pixelY: number,
    canvasWidth: number,
    canvasHeight: number,
    centerReal: Decimal,
    centerImag: Decimal,
    zoom: Decimal,
    maxIterations: number,
    fractalType: FractalType,
    juliaReal: Decimal,
    juliaImag: Decimal
): FractalResult {
    // Convert pixel to complex coordinate
    const offsetX = new Decimal(pixelX - canvasWidth / 2).div(zoom);
    const offsetY = new Decimal(canvasHeight / 2 - pixelY).div(zoom);
    const real = centerReal.plus(offsetX);
    const imag = centerImag.plus(offsetY);

    switch (fractalType) {
        case 'mandelbrot':
            return computeMandelbrot(real, imag, maxIterations);
        case 'julia':
            return computeJulia(real, imag, juliaReal, juliaImag, maxIterations);
        case 'burningShip':
            return computeBurningShip(real, imag, maxIterations);
        case 'tricorn':
            return computeTricorn(real, imag, maxIterations);
        default:
            return computeMandelbrot(real, imag, maxIterations);
    }
}

function processPixels(msg: ComputePixelsMessage): void {
    const startTime = performance.now();

    const results: number[] = [];
    const totalPixels = msg.pixels.length / 2;
    let pixelsCompleted = 0;
    let lastProgressTime = startTime;
    const PROGRESS_INTERVAL_MS = 200;

    // Check if we can use fast float mode (zoom below precision threshold)
    const zoomNum = parseFloat(msg.zoomStr);
    const useFloatMode = zoomNum < FLOAT_PRECISION_THRESHOLD;

    if (useFloatMode) {
        // Fast path: use native JavaScript numbers (10-100x faster)
        const centerReal = parseFloat(msg.centerRealStr);
        const centerImag = parseFloat(msg.centerImagStr);
        const juliaReal = parseFloat(msg.juliaRealStr);
        const juliaImag = parseFloat(msg.juliaImagStr);

        for (let i = 0; i < msg.pixels.length; i += 2) {
            const pixelX = msg.pixels[i];
            const pixelY = msg.pixels[i + 1];

            const result = computePixelFloat(
                pixelX, pixelY,
                msg.canvasWidth, msg.canvasHeight,
                centerReal, centerImag, zoomNum,
                msg.maxIterations,
                msg.fractalType,
                juliaReal, juliaImag
            );

            results.push(pixelX, pixelY, result.iter, result.mag);
            pixelsCompleted++;

            const now = performance.now();
            if (now - lastProgressTime >= PROGRESS_INTERVAL_MS) {
                lastProgressTime = now;
                ctx.postMessage({
                    type: 'PROGRESS',
                    workerId,
                    renderId: msg.renderId,
                    pixelsCompleted,
                    totalPixels,
                    passNumber: msg.passNumber
                } as WorkerMessage);
            }
        }
    } else {
        // Slow path: use Decimal.js for arbitrary precision (extreme zoom levels)
        configurePrecisionIfNeeded(msg.zoomStr);

        const centerReal = new Decimal(msg.centerRealStr);
        const centerImag = new Decimal(msg.centerImagStr);
        const zoom = new Decimal(msg.zoomStr);
        const juliaReal = new Decimal(msg.juliaRealStr);
        const juliaImag = new Decimal(msg.juliaImagStr);

        for (let i = 0; i < msg.pixels.length; i += 2) {
            const pixelX = msg.pixels[i];
            const pixelY = msg.pixels[i + 1];

            const result = computePixel(
                pixelX, pixelY,
                msg.canvasWidth, msg.canvasHeight,
                centerReal, centerImag, zoom,
                msg.maxIterations,
                msg.fractalType,
                juliaReal, juliaImag
            );

            results.push(pixelX, pixelY, result.iter, result.mag);
            pixelsCompleted++;

            const now = performance.now();
            if (now - lastProgressTime >= PROGRESS_INTERVAL_MS) {
                lastProgressTime = now;
                ctx.postMessage({
                    type: 'PROGRESS',
                    workerId,
                    renderId: msg.renderId,
                    pixelsCompleted,
                    totalPixels,
                    passNumber: msg.passNumber
                } as WorkerMessage);
            }
        }
    }

    ctx.postMessage({
        type: 'PIXELS_RESULT',
        workerId,
        renderId: msg.renderId,
        results,
        passNumber: msg.passNumber,
        computeTimeMs: performance.now() - startTime
    } as WorkerMessage);
}

ctx.onmessage = (event: MessageEvent<CoordinatorMessage>) => {
    const message = event.data;

    switch (message.type) {
        case 'INIT':
            workerId = message.workerId;
            ctx.postMessage({ type: 'READY', workerId } as WorkerMessage);
            break;

        case 'COMPUTE_PIXELS':
            processPixels(message);
            break;

        case 'STOP':
            close();
            break;
    }
};
