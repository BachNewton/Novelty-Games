import { FRACTAL_ALGORITHMS } from '../data/FractalTypes';
import { COLOR_PALETTE_CODE } from '../data/ColorPalettes';

// This creates inline web worker code as a Blob URL
// This approach works with Create React App without ejecting

const workerCode = `
${FRACTAL_ALGORITHMS}

${COLOR_PALETTE_CODE}

let workerId = -1;

self.onmessage = function(e) {
    const message = e.data;

    if (message.type === 'INIT') {
        workerId = message.workerId;
        return;
    }

    if (message.type === 'COMPUTE_TILE') {
        const startTime = performance.now();
        const {
            tileId,
            tileWidth,
            tileHeight,
            realMin,
            realMax,
            imagMin,
            imagMax,
            fractalType,
            maxIterations,
            paletteId,
            juliaReal,
            juliaImag
        } = message;

        // Create image data array (RGBA)
        const imageData = new Uint8ClampedArray(tileWidth * tileHeight * 4);

        const realStep = (realMax - realMin) / tileWidth;
        const imagStep = (imagMax - imagMin) / tileHeight;

        for (let py = 0; py < tileHeight; py++) {
            const imag = imagMin + py * imagStep;

            for (let px = 0; px < tileWidth; px++) {
                const real = realMin + px * realStep;

                // Compute iteration count
                const iteration = computeFractal(
                    fractalType,
                    real,
                    imag,
                    juliaReal || 0,
                    juliaImag || 0,
                    maxIterations
                );

                // Get color
                const [r, g, b] = getColor(paletteId, iteration, maxIterations);

                // Write to image data
                const idx = (py * tileWidth + px) * 4;
                imageData[idx] = r;
                imageData[idx + 1] = g;
                imageData[idx + 2] = b;
                imageData[idx + 3] = 255; // Alpha
            }
        }

        const computeTimeMs = performance.now() - startTime;

        // Send the data (without transfer to avoid detachment issues)
        self.postMessage({
            type: 'TILE_COMPLETE',
            tileId,
            workerId,
            imageData: Array.from(imageData),
            tileWidth,
            tileHeight,
            computeTimeMs
        });
    }
};
`;

export function createFractalWorker(): Worker {
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    return new Worker(url);
}
