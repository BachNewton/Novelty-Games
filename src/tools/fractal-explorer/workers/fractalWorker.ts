import Decimal from 'decimal.js';
import { CoordinatorMessage, WorkerMessage, ComputePixelsMessage } from './FractalWorkerMessages';
import { FractalType } from '../data/FractalTypes';

/* eslint-disable no-restricted-globals */
const ctx: Worker = self as unknown as Worker;
let workerId = -1;

// Configure Decimal.js for arbitrary precision
function configurePrecision(zoomStr: string): void {
    const zoom = new Decimal(zoomStr);
    // Calculate needed precision: roughly log10(zoom) * 1.5 + buffer
    const zoomDigits = zoom.abs().log(10).toNumber();
    const neededPrecision = Math.max(30, Math.ceil(zoomDigits * 1.5) + 20);
    Decimal.set({ precision: neededPrecision });
}

function computeMandelbrot(
    cReal: Decimal,
    cImag: Decimal,
    maxIterations: number
): number {
    let zr = new Decimal(0);
    let zi = new Decimal(0);
    let zr2 = new Decimal(0);
    let zi2 = new Decimal(0);
    const four = new Decimal(4);

    for (let i = 0; i < maxIterations; i++) {
        if (zr2.plus(zi2).gt(four)) {
            return i;
        }

        zi = zr.times(zi).times(2).plus(cImag);
        zr = zr2.minus(zi2).plus(cReal);
        zr2 = zr.times(zr);
        zi2 = zi.times(zi);
    }

    return maxIterations;
}

function computeJulia(
    zReal: Decimal,
    zImag: Decimal,
    cReal: Decimal,
    cImag: Decimal,
    maxIterations: number
): number {
    let zr = zReal;
    let zi = zImag;
    let zr2 = zr.times(zr);
    let zi2 = zi.times(zi);
    const four = new Decimal(4);

    for (let i = 0; i < maxIterations; i++) {
        if (zr2.plus(zi2).gt(four)) {
            return i;
        }

        zi = zr.times(zi).times(2).plus(cImag);
        zr = zr2.minus(zi2).plus(cReal);
        zr2 = zr.times(zr);
        zi2 = zi.times(zi);
    }

    return maxIterations;
}

function computeBurningShip(
    cReal: Decimal,
    cImag: Decimal,
    maxIterations: number
): number {
    let zr = new Decimal(0);
    let zi = new Decimal(0);
    let zr2 = new Decimal(0);
    let zi2 = new Decimal(0);
    const four = new Decimal(4);

    for (let i = 0; i < maxIterations; i++) {
        if (zr2.plus(zi2).gt(four)) {
            return i;
        }

        // Burning Ship uses absolute values
        const absZr = zr.abs();
        const absZi = zi.abs();
        zi = absZr.times(absZi).times(2).plus(cImag);
        zr = zr2.minus(zi2).plus(cReal);
        zr2 = zr.times(zr);
        zi2 = zi.times(zi);
    }

    return maxIterations;
}

function computeTricorn(
    cReal: Decimal,
    cImag: Decimal,
    maxIterations: number
): number {
    let zr = new Decimal(0);
    let zi = new Decimal(0);
    let zr2 = new Decimal(0);
    let zi2 = new Decimal(0);
    const four = new Decimal(4);

    for (let i = 0; i < maxIterations; i++) {
        if (zr2.plus(zi2).gt(four)) {
            return i;
        }

        // Tricorn: conjugate z (negate imaginary in multiplication)
        zi = zr.times(zi).times(-2).plus(cImag);
        zr = zr2.minus(zi2).plus(cReal);
        zr2 = zr.times(zr);
        zi2 = zi.times(zi);
    }

    return maxIterations;
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
): number {
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

    configurePrecision(msg.zoomStr);

    const centerReal = new Decimal(msg.centerRealStr);
    const centerImag = new Decimal(msg.centerImagStr);
    const zoom = new Decimal(msg.zoomStr);
    const juliaReal = new Decimal(msg.juliaRealStr);
    const juliaImag = new Decimal(msg.juliaImagStr);

    const results: number[] = [];
    const totalPixels = msg.pixels.length / 2;
    let pixelsCompleted = 0;

    for (let i = 0; i < msg.pixels.length; i += 2) {
        const pixelX = msg.pixels[i];
        const pixelY = msg.pixels[i + 1];

        const iterations = computePixel(
            pixelX, pixelY,
            msg.canvasWidth, msg.canvasHeight,
            centerReal, centerImag, zoom,
            msg.maxIterations,
            msg.fractalType,
            juliaReal, juliaImag
        );

        results.push(pixelX, pixelY, iterations);
        pixelsCompleted++;

        // Send progress every 100 pixels
        if (pixelsCompleted % 100 === 0) {
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
