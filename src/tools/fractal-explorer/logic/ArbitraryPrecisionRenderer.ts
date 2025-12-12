import { RenderParams, ArbitraryPrecisionRenderParams, RenderMode, RenderProgress } from './FractalRenderer';
import { CoordinatorMessage, WorkerMessage, ComputePixelsMessage } from '../workers/FractalWorkerMessages';
import { getColorForIteration } from './ColorUtils';

export interface ArbitraryPrecisionRenderer {
    resize: (width: number, height: number) => void;
    render: (params: RenderParams | ArbitraryPrecisionRenderParams) => void;
    dispose: () => void;
    getMode: () => RenderMode;
    setOnProgress: (callback: (progress: RenderProgress) => void) => void;
    cancelRender: () => void;
}

// Pass configurations - each pass computes pixels at step intervals
// Pass 0: every 8th pixel (1/64 of total)
// Pass 1: every 4th pixel that wasn't in pass 0
// Pass 2: every 2nd pixel that wasn't in previous passes
// Pass 3: remaining pixels
const PASSES = [
    { step: 8 },
    { step: 4 },
    { step: 2 },
    { step: 1 }
];

export function createArbitraryPrecisionRenderer(
    canvas: HTMLCanvasElement
): ArbitraryPrecisionRenderer {
    const ctx = canvas.getContext('2d')!;
    const workerCount = navigator.hardwareConcurrency || 4;
    const workers: Worker[] = [];
    const workersReady: boolean[] = [];

    let currentParams: ArbitraryPrecisionRenderParams | null = null;
    let currentPass = 0;
    let onProgressCallback: ((progress: RenderProgress) => void) | null = null;
    let renderCancelled = false;

    // Iteration buffer: stores computed iterations for each pixel
    // -1 means not yet computed
    let iterationBuffer: Int32Array | null = null;

    // Track pixels completed per pass
    let pixelsCompletedInPass = 0;
    let totalPixelsInPass = 0;
    let workersCompletedInPass = 0;
    let totalWorkersInPass = 0;

    // Track which step we're currently rendering at (for upscaling)
    let currentStepForRender = PASSES[0].step;

    const initializeWorkers = () => {
        for (let i = 0; i < workerCount; i++) {
            const worker = new Worker(
                new URL('../workers/fractalWorker.ts', import.meta.url)
            );

            worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
                handleWorkerMessage(i, event.data);
            };

            worker.onerror = (error) => {
                console.error(`Fractal worker ${i} error:`, error);
            };

            workers.push(worker);
            workersReady.push(false);

            const initMsg: CoordinatorMessage = { type: 'INIT', workerId: i };
            worker.postMessage(initMsg);
        }
    };

    const handleWorkerMessage = (workerIdx: number, message: WorkerMessage) => {
        if (message.type === 'READY') {
            workersReady[workerIdx] = true;
            return;
        }

        if (message.type === 'PROGRESS') {
            pixelsCompletedInPass += 100; // Approximate since we send every 100
            if (onProgressCallback && !renderCancelled) {
                onProgressCallback({
                    mode: 'cpu',
                    percentComplete: Math.min(100, (pixelsCompletedInPass / totalPixelsInPass) * 100),
                    currentPass: currentPass + 1,
                    totalPasses: PASSES.length
                });
            }
            return;
        }

        if (message.type === 'PIXELS_RESULT') {
            if (renderCancelled) return;

            const { results } = message;

            // Update iteration buffer
            for (let i = 0; i < results.length; i += 3) {
                const x = results[i];
                const y = results[i + 1];
                const iter = results[i + 2];

                if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
                    iterationBuffer![y * canvas.width + x] = iter;
                }
            }

            workersCompletedInPass++;

            // Check if all workers completed this pass
            if (workersCompletedInPass >= totalWorkersInPass) {
                // Render the completed pass
                renderToCanvas();

                // Move to next pass
                const nextPass = currentPass + 1;
                if (nextPass < PASSES.length && !renderCancelled) {
                    startPass(nextPass);
                } else {
                    // All passes complete
                    if (onProgressCallback) {
                        onProgressCallback({
                            mode: 'cpu',
                            percentComplete: 100,
                            currentPass: PASSES.length,
                            totalPasses: PASSES.length
                        });
                    }
                }
            }
        }
    };

    const renderToCanvas = () => {
        if (!iterationBuffer || !currentParams) return;

        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const idx = y * canvas.width + x;
                let iter = iterationBuffer[idx];

                // If this pixel hasn't been computed yet, sample from nearest computed pixel
                if (iter === -1) {
                    // Find nearest computed pixel by rounding down to current step grid
                    const sampleX = Math.floor(x / currentStepForRender) * currentStepForRender;
                    const sampleY = Math.floor(y / currentStepForRender) * currentStepForRender;
                    const sampleIdx = sampleY * canvas.width + sampleX;
                    iter = iterationBuffer[sampleIdx];
                    if (iter === -1) iter = 0; // Fallback to black
                }

                const [r, g, b] = getColorForIteration(
                    iter,
                    currentParams.maxIterations,
                    currentParams.paletteId
                );

                const pixelIdx = idx * 4;
                data[pixelIdx] = r;
                data[pixelIdx + 1] = g;
                data[pixelIdx + 2] = b;
                data[pixelIdx + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    };

    const getPixelsForPass = (passIndex: number): number[][] => {
        const step = PASSES[passIndex].step;
        const allPixels: number[] = [];

        // Compute all pixels that are on this pass's grid but weren't on any previous grid
        for (let y = 0; y < canvas.height; y += step) {
            for (let x = 0; x < canvas.width; x += step) {
                // Check if this pixel was already computed in a previous pass
                let alreadyComputed = false;
                for (let p = 0; p < passIndex; p++) {
                    const prevStep = PASSES[p].step;
                    if ((x % prevStep === 0) && (y % prevStep === 0)) {
                        alreadyComputed = true;
                        break;
                    }
                }

                if (!alreadyComputed) {
                    allPixels.push(x, y);
                }
            }
        }

        // Distribute pixels among workers
        const totalPixelCount = allPixels.length / 2;
        const pixelsPerWorker = Math.ceil(totalPixelCount / workerCount);
        const workerPixels: number[][] = [];

        for (let w = 0; w < workerCount; w++) {
            const startIdx = w * pixelsPerWorker * 2;
            const endIdx = Math.min(startIdx + pixelsPerWorker * 2, allPixels.length);
            workerPixels.push(allPixels.slice(startIdx, endIdx));
        }

        return workerPixels;
    };

    const startPass = (passIndex: number) => {
        if (!currentParams || renderCancelled) return;

        currentPass = passIndex;
        currentStepForRender = PASSES[passIndex].step;
        pixelsCompletedInPass = 0;
        workersCompletedInPass = 0;

        const workerPixels = getPixelsForPass(passIndex);
        totalPixelsInPass = workerPixels.reduce((sum, arr) => sum + arr.length / 2, 0);
        totalWorkersInPass = workerPixels.filter(arr => arr.length > 0).length;

        if (totalWorkersInPass === 0) {
            // No pixels to compute in this pass, move to next
            const nextPass = passIndex + 1;
            if (nextPass < PASSES.length) {
                startPass(nextPass);
            }
            // else: All passes complete
            return;
        }

        // Report progress at start of pass
        if (onProgressCallback) {
            onProgressCallback({
                mode: 'cpu',
                percentComplete: 0,
                currentPass: passIndex + 1,
                totalPasses: PASSES.length
            });
        }

        // Send work to each worker that has pixels
        workerPixels.forEach((pixels, workerIdx) => {
            if (pixels.length === 0) return;

            const msg: ComputePixelsMessage = {
                type: 'COMPUTE_PIXELS',
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                pixels,
                centerRealStr: currentParams!.centerRealStr,
                centerImagStr: currentParams!.centerImagStr,
                zoomStr: currentParams!.zoomStr,
                maxIterations: currentParams!.maxIterations,
                fractalType: currentParams!.fractalType,
                juliaRealStr: String(currentParams!.juliaReal),
                juliaImagStr: String(currentParams!.juliaImag),
                passNumber: passIndex + 1,
                totalPasses: PASSES.length
            };

            workers[workerIdx].postMessage(msg);
        });
    };

    // Initialize workers on creation
    initializeWorkers();

    return {
        resize: (width: number, height: number) => {
            canvas.width = width;
            canvas.height = height;
            iterationBuffer = new Int32Array(width * height).fill(-1);
        },

        render: (params: RenderParams | ArbitraryPrecisionRenderParams) => {
            // Convert to arbitrary precision params if needed
            const apParams: ArbitraryPrecisionRenderParams = {
                ...params,
                centerRealStr: (params as ArbitraryPrecisionRenderParams).centerRealStr
                    || String(params.centerReal),
                centerImagStr: (params as ArbitraryPrecisionRenderParams).centerImagStr
                    || String(params.centerImag),
                zoomStr: (params as ArbitraryPrecisionRenderParams).zoomStr
                    || String(params.zoom)
            };

            currentParams = apParams;
            renderCancelled = false;
            currentPass = 0;
            currentStepForRender = PASSES[0].step;

            // Clear iteration buffer
            if (!iterationBuffer || iterationBuffer.length !== canvas.width * canvas.height) {
                iterationBuffer = new Int32Array(canvas.width * canvas.height);
            }
            iterationBuffer.fill(-1);

            // Clear canvas with black
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Start first pass
            startPass(0);
        },

        dispose: () => {
            renderCancelled = true;
            workers.forEach(worker => {
                worker.postMessage({ type: 'STOP' } as CoordinatorMessage);
                worker.terminate();
            });
            workers.length = 0;
            workersReady.length = 0;
        },

        getMode: () => 'cpu' as RenderMode,

        cancelRender: () => {
            renderCancelled = true;
        },

        setOnProgress: (callback: (progress: RenderProgress) => void) => {
            onProgressCallback = callback;
        }
    };
}
