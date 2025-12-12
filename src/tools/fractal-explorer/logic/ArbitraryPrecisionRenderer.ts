import { RenderParams, ArbitraryPrecisionRenderParams, RenderMode, RenderProgress } from './FractalRenderer';
import { CoordinatorMessage, WorkerMessage, ComputePixelsMessage } from '../workers/FractalWorkerMessages';
import { ColorLUT, createColorLUT } from './ColorUtils';

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

    // Unique ID for each render request to ignore stale worker results
    let currentRenderId = 0;

    // Track pending render - if a render is requested while workers are busy,
    // we store it here and start it when the current render completes or is abandoned
    let pendingRenderParams: ArbitraryPrecisionRenderParams | null = null;

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

    // Track if we're actively rendering (workers are computing)
    let isRendering = false;

    // Color lookup table for fast color retrieval
    let colorLUT: ColorLUT | null = null;

    // Track previous render params for pan carryover optimization
    let lastCenterRealStr: string | null = null;
    let lastCenterImagStr: string | null = null;
    let lastZoomStr: string | null = null;
    let lastMaxIterations: number | null = null;
    let lastFractalType: string | null = null;

    // Check if we can reuse the buffer (pan without zoom change)
    const canReuseBuffer = (params: ArbitraryPrecisionRenderParams): { dx: number; dy: number } | null => {
        // Can't reuse if params that affect computation changed
        if (!lastZoomStr || lastZoomStr !== params.zoomStr) return null;
        if (!lastMaxIterations || lastMaxIterations !== params.maxIterations) return null;
        if (!lastFractalType || lastFractalType !== params.fractalType) return null;
        if (!iterationBuffer) return null;

        // Calculate pixel offset from center change
        const zoom = parseFloat(params.zoomStr);
        const dxWorld = parseFloat(params.centerRealStr) - parseFloat(lastCenterRealStr!);
        const dyWorld = parseFloat(params.centerImagStr) - parseFloat(lastCenterImagStr!);

        const dxPixels = Math.round(dxWorld * zoom);
        const dyPixels = Math.round(-dyWorld * zoom); // Y is inverted

        // Only reuse if pan is reasonable (not more than half the screen)
        if (Math.abs(dxPixels) > canvas.width / 2 || Math.abs(dyPixels) > canvas.height / 2) {
            return null;
        }

        // Don't bother for tiny movements
        if (dxPixels === 0 && dyPixels === 0) {
            return null;
        }

        return { dx: dxPixels, dy: dyPixels };
    };

    // Shift the iteration buffer for pan reuse
    const shiftBuffer = (dx: number, dy: number) => {
        if (!iterationBuffer) return;

        const width = canvas.width;
        const height = canvas.height;
        const newBuffer = new Int32Array(width * height);
        newBuffer.fill(-1);

        // Copy shifted pixels
        for (let y = 0; y < height; y++) {
            const srcY = y + dy;
            if (srcY < 0 || srcY >= height) continue;

            for (let x = 0; x < width; x++) {
                const srcX = x + dx;
                if (srcX < 0 || srcX >= width) continue;

                const srcIdx = srcY * width + srcX;
                const dstIdx = y * width + x;
                newBuffer[dstIdx] = iterationBuffer[srcIdx];
            }
        }

        iterationBuffer = newBuffer;
    };

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

    // Start the actual rendering process with given params
    const startRender = (params: ArbitraryPrecisionRenderParams) => {
        currentParams = params;
        renderCancelled = false;
        currentPass = 0;
        currentStepForRender = PASSES[0].step;
        currentRenderId++;
        isRendering = true;

        // Create/update color LUT if palette or maxIterations changed
        if (!colorLUT || colorLUT.maxIterations !== params.maxIterations || colorLUT.paletteId !== params.paletteId) {
            colorLUT = createColorLUT(params.maxIterations, params.paletteId);
        }

        // Check if we can reuse pixels from the previous render (pan optimization)
        const reuseOffset = canReuseBuffer(params);

        if (reuseOffset) {
            // Pan detected - shift buffer and only compute new edge pixels
            shiftBuffer(reuseOffset.dx, reuseOffset.dy);
        } else {
            // Full clear for zoom change, param change, or large pan
            if (!iterationBuffer || iterationBuffer.length !== canvas.width * canvas.height) {
                iterationBuffer = new Int32Array(canvas.width * canvas.height);
            }
            iterationBuffer.fill(-1);

            // Clear canvas with black
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Update tracking for next render
        lastCenterRealStr = params.centerRealStr;
        lastCenterImagStr = params.centerImagStr;
        lastZoomStr = params.zoomStr;
        lastMaxIterations = params.maxIterations;
        lastFractalType = params.fractalType;

        // Start first pass
        startPass(0);
    };

    // Check if there's a pending render and start it
    const checkPendingRender = () => {
        if (pendingRenderParams) {
            const params = pendingRenderParams;
            pendingRenderParams = null;
            startRender(params);
        }
    };

    const handleWorkerMessage = (workerIdx: number, message: WorkerMessage) => {
        if (message.type === 'READY') {
            workersReady[workerIdx] = true;
            return;
        }

        if (message.type === 'PROGRESS') {
            // Ignore progress from old renders
            if (message.renderId !== currentRenderId) return;

            // Use actual pixels completed from worker (more accurate with time-based reporting)
            pixelsCompletedInPass = message.pixelsCompleted;
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
            // Ignore results from old renders
            if (message.renderId !== currentRenderId) {
                // Old render result - check if there's a pending render we should start
                // (This means workers have finished processing old work)
                if (pendingRenderParams && !isRendering) {
                    checkPendingRender();
                }
                return;
            }

            if (renderCancelled) {
                // Current render was cancelled - mark as not rendering and check for pending
                workersCompletedInPass++;
                if (workersCompletedInPass >= totalWorkersInPass) {
                    isRendering = false;
                    checkPendingRender();
                }
                return;
            }

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
                // Render the completed pass (async to prevent UI freeze)
                renderToCanvas(() => {
                    // Move to next pass after canvas update completes
                    const nextPass = currentPass + 1;
                    if (nextPass < PASSES.length && !renderCancelled) {
                        startPass(nextPass);
                    } else {
                        // All passes complete
                        isRendering = false;
                        if (onProgressCallback) {
                            onProgressCallback({
                                mode: 'cpu',
                                percentComplete: 100,
                                currentPass: PASSES.length,
                                totalPasses: PASSES.length
                            });
                        }
                        // Check if a new render was requested while we were working
                        checkPendingRender();
                    }
                });
            }
        }
    };

    // Chunked canvas rendering to prevent UI freezes
    const CHUNK_SIZE = 20000; // Pixels per chunk - balances responsiveness vs overhead

    const renderToCanvas = (onComplete: () => void) => {
        if (!iterationBuffer || !currentParams || !colorLUT) {
            onComplete();
            return;
        }

        const width = canvas.width;
        const height = canvas.height;
        const totalPixels = width * height;
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        const lutData = colorLUT.data;
        const maxIter = currentParams.maxIterations;
        const step = currentStepForRender;
        const buffer = iterationBuffer;
        let currentPixel = 0;
        const renderIdAtStart = currentRenderId;

        const processChunk = () => {
            // Check if render was cancelled
            if (renderCancelled || currentRenderId !== renderIdAtStart) {
                onComplete();
                return;
            }

            const endPixel = Math.min(currentPixel + CHUNK_SIZE, totalPixels);

            for (let idx = currentPixel; idx < endPixel; idx++) {
                let iter = buffer[idx];

                // If this pixel hasn't been computed yet, sample from nearest computed pixel
                if (iter === -1) {
                    const x = idx % width;
                    const y = Math.floor(idx / width);
                    const sampleX = Math.floor(x / step) * step;
                    const sampleY = Math.floor(y / step) * step;
                    const sampleIdx = sampleY * width + sampleX;
                    iter = buffer[sampleIdx];
                    if (iter === -1) iter = 0; // Fallback to black
                }

                const pixelIdx = idx * 4;
                if (iter >= maxIter) {
                    // In the set - black
                    data[pixelIdx] = 0;
                    data[pixelIdx + 1] = 0;
                    data[pixelIdx + 2] = 0;
                } else {
                    // Use LUT for fast color lookup
                    const lutIdx = iter * 3;
                    data[pixelIdx] = lutData[lutIdx];
                    data[pixelIdx + 1] = lutData[lutIdx + 1];
                    data[pixelIdx + 2] = lutData[lutIdx + 2];
                }
                data[pixelIdx + 3] = 255;
            }

            currentPixel = endPixel;

            if (currentPixel < totalPixels) {
                // More chunks to process - yield to event loop
                requestAnimationFrame(processChunk);
            } else {
                // All chunks done - update canvas and notify
                ctx.putImageData(imageData, 0, 0);
                onComplete();
            }
        };

        // Start processing
        requestAnimationFrame(processChunk);
    };

    const getPixelsForPass = (passIndex: number): number[][] => {
        const step = PASSES[passIndex].step;
        const allPixels: number[] = [];
        const width = canvas.width;

        // Compute all pixels that are on this pass's grid but weren't on any previous grid
        for (let y = 0; y < canvas.height; y += step) {
            for (let x = 0; x < width; x += step) {
                // Skip if already computed (from buffer reuse during pan)
                if (iterationBuffer && iterationBuffer[y * width + x] !== -1) {
                    continue;
                }

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
                renderId: currentRenderId,
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

            if (isRendering) {
                // Workers are busy - store this as pending and cancel current render
                // The pending render will start when workers finish their current work
                pendingRenderParams = apParams;
                renderCancelled = true;
                return;
            }

            // No render in progress - start immediately
            startRender(apParams);
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
