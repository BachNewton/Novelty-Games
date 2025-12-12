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
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
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

    // Magnitude buffer: stores escape magnitude for smooth coloring
    // 0 means in set or not yet computed
    let magnitudeBuffer: Float32Array | null = null;

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

    // Captured canvas for preview during pan/zoom
    let capturedImage: ImageData | null = null;

    // Capture current canvas content for preview
    const captureCanvas = () => {
        if (canvas.width > 0 && canvas.height > 0) {
            capturedImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
    };

    // Draw transformed preview (pan)
    const drawPanPreview = (dx: number, dy: number) => {
        if (!capturedImage) return;

        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the captured image shifted by the pan offset
        // Note: dx/dy are the buffer shift amounts (source to dest mapping)
        // For visual preview, we draw at the negative offset
        ctx.putImageData(capturedImage, -dx, -dy);
    };

    // Draw transformed preview (zoom)
    const drawZoomPreview = (scale: number, centerX: number, centerY: number) => {
        if (!capturedImage) return;

        // Create temporary canvas to hold captured image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCtx.putImageData(capturedImage, 0, 0);

        // Clear main canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw scaled image centered on zoom point
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
    };

    // Calculate zoom transform parameters
    // Back-calculates the cursor position where zoom occurred from center/zoom changes
    const getZoomTransform = (params: ArbitraryPrecisionRenderParams): { scale: number; centerX: number; centerY: number } | null => {
        if (!lastZoomStr || !lastCenterRealStr || !lastCenterImagStr) return null;
        if (lastZoomStr === params.zoomStr) return null; // No zoom change

        const oldZoom = parseFloat(lastZoomStr);
        const newZoom = parseFloat(params.zoomStr);
        const scale = newZoom / oldZoom;

        const oldCenterReal = parseFloat(lastCenterRealStr);
        const oldCenterImag = parseFloat(lastCenterImagStr);
        const newCenterReal = parseFloat(params.centerRealStr);
        const newCenterImag = parseFloat(params.centerImagStr);

        const zoomDiff = newZoom - oldZoom;

        // Avoid division by zero (shouldn't happen since we checked zoom changed)
        if (Math.abs(zoomDiff) < 1e-10) {
            return { scale, centerX: canvas.width / 2, centerY: canvas.height / 2 };
        }

        // Back-calculate the zoom center point in canvas coordinates
        // The zoom center is the point whose world position didn't change
        // Derivation: worldX = centerReal + (px - W/2) / zoom
        // Setting old and new equal and solving for px gives:
        // px = W/2 + (newCenterReal - oldCenterReal) * oldZoom * newZoom / (newZoom - oldZoom)
        const dxWorld = newCenterReal - oldCenterReal;
        const dyWorld = newCenterImag - oldCenterImag;

        const zoomCenterX = canvas.width / 2 + dxWorld * oldZoom * newZoom / zoomDiff;
        // Y is inverted: canvas Y increases downward, imaginary increases upward
        const zoomCenterY = canvas.height / 2 - dyWorld * oldZoom * newZoom / zoomDiff;

        return { scale, centerX: zoomCenterX, centerY: zoomCenterY };
    };

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

    // Shift the iteration and magnitude buffers for pan reuse
    const shiftBuffer = (dx: number, dy: number) => {
        if (!iterationBuffer || !magnitudeBuffer) return;

        const width = canvas.width;
        const height = canvas.height;
        const newIterBuffer = new Int32Array(width * height);
        const newMagBuffer = new Float32Array(width * height);
        newIterBuffer.fill(-1);
        // magnitudeBuffer defaults to 0 (Float32Array is zero-initialized)

        // Copy shifted pixels
        for (let y = 0; y < height; y++) {
            const srcY = y + dy;
            if (srcY < 0 || srcY >= height) continue;

            for (let x = 0; x < width; x++) {
                const srcX = x + dx;
                if (srcX < 0 || srcX >= width) continue;

                const srcIdx = srcY * width + srcX;
                const dstIdx = y * width + x;
                newIterBuffer[dstIdx] = iterationBuffer[srcIdx];
                newMagBuffer[dstIdx] = magnitudeBuffer[srcIdx];
            }
        }

        iterationBuffer = newIterBuffer;
        magnitudeBuffer = newMagBuffer;
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

        // Check transforms before capturing (need old params for calculations)
        const reuseOffset = canReuseBuffer(params);
        const zoomTransform = getZoomTransform(params);

        // Capture current canvas for preview before modifying anything
        captureCanvas();

        // Draw immediate preview while computation runs
        if (reuseOffset) {
            // Pan preview - draw shifted image
            drawPanPreview(reuseOffset.dx, reuseOffset.dy);
            // Shift data buffer for computation reuse
            shiftBuffer(reuseOffset.dx, reuseOffset.dy);
        } else if (zoomTransform) {
            // Zoom preview - draw scaled image
            drawZoomPreview(zoomTransform.scale, zoomTransform.centerX, zoomTransform.centerY);
            // Full buffer clear for zoom
            const bufferSize = canvas.width * canvas.height;
            if (!iterationBuffer || iterationBuffer.length !== bufferSize) {
                iterationBuffer = new Int32Array(bufferSize);
                magnitudeBuffer = new Float32Array(bufferSize);
            }
            iterationBuffer.fill(-1);
            magnitudeBuffer!.fill(0);
        } else {
            // Full clear for param change or first render
            const bufferSize = canvas.width * canvas.height;
            if (!iterationBuffer || iterationBuffer.length !== bufferSize) {
                iterationBuffer = new Int32Array(bufferSize);
                magnitudeBuffer = new Float32Array(bufferSize);
            }
            iterationBuffer.fill(-1);
            magnitudeBuffer!.fill(0);
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

            // Update iteration and magnitude buffers
            // Format: [x0, y0, iter0, mag0, x1, y1, iter1, mag1, ...]
            for (let i = 0; i < results.length; i += 4) {
                const x = results[i];
                const y = results[i + 1];
                const iter = results[i + 2];
                const mag = results[i + 3];

                if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
                    const idx = y * canvas.width + x;
                    iterationBuffer![idx] = iter;
                    magnitudeBuffer![idx] = mag;
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
        if (!iterationBuffer || !magnitudeBuffer || !currentParams || !colorLUT) {
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
        const iterBuffer = iterationBuffer;
        const magBuffer = magnitudeBuffer;
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
                let iter = iterBuffer[idx];
                let mag = magBuffer[idx];

                // If this pixel hasn't been computed yet, sample from nearest computed pixel
                if (iter === -1) {
                    const x = idx % width;
                    const y = Math.floor(idx / width);
                    const sampleX = Math.floor(x / step) * step;
                    const sampleY = Math.floor(y / step) * step;
                    const sampleIdx = sampleY * width + sampleX;
                    iter = iterBuffer[sampleIdx];
                    mag = magBuffer[sampleIdx];
                    if (iter === -1) iter = 0; // Fallback to black
                }

                const pixelIdx = idx * 4;
                if (iter >= maxIter) {
                    // In the set - black
                    data[pixelIdx] = 0;
                    data[pixelIdx + 1] = 0;
                    data[pixelIdx + 2] = 0;
                } else {
                    // Apply smooth iteration formula for anti-aliased color gradients
                    // Same formula as GPU shader: smoothIter = iter - log2(log2(mag)) + 4
                    let smoothIter = iter;
                    if (mag > 0) {
                        // mag is already zr² + zi², same as GPU's mag2
                        smoothIter = iter - Math.log2(Math.log2(mag)) + 4;
                    }

                    // Get fractional part for interpolation
                    const t = smoothIter - Math.floor(smoothIter);
                    const baseIter = Math.floor(smoothIter);

                    // Clamp to valid LUT range
                    const iter1 = Math.max(0, Math.min(maxIter - 1, baseIter));
                    const iter2 = Math.max(0, Math.min(maxIter - 1, baseIter + 1));

                    // Interpolate between two adjacent colors for smooth gradient
                    const lutIdx1 = iter1 * 3;
                    const lutIdx2 = iter2 * 3;
                    data[pixelIdx] = Math.round(lutData[lutIdx1] * (1 - t) + lutData[lutIdx2] * t);
                    data[pixelIdx + 1] = Math.round(lutData[lutIdx1 + 1] * (1 - t) + lutData[lutIdx2 + 1] * t);
                    data[pixelIdx + 2] = Math.round(lutData[lutIdx1 + 2] * (1 - t) + lutData[lutIdx2 + 2] * t);
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
            const bufferSize = width * height;
            iterationBuffer = new Int32Array(bufferSize).fill(-1);
            magnitudeBuffer = new Float32Array(bufferSize);
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
