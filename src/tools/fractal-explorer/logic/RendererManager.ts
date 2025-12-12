import { RenderParams, ArbitraryPrecisionRenderParams, RenderMode, RenderProgress } from './FractalRenderer';
import { WebGLRenderer } from './WebGLRenderer';
import { createArbitraryPrecisionRenderer, ArbitraryPrecisionRenderer } from './ArbitraryPrecisionRenderer';

// Threshold where GPU precision starts to degrade (single precision float limit)
const GPU_PRECISION_THRESHOLD = 1e7;

export interface RendererManager {
    resize: (width: number, height: number) => void;
    render: (params: RenderParams | ArbitraryPrecisionRenderParams) => void;
    dispose: () => void;
    getCurrentMode: () => RenderMode;
    setOnModeChange: (callback: (mode: RenderMode) => void) => void;
    setOnProgress: (callback: (progress: RenderProgress) => void) => void;
    cancelRender: () => void;
}

export function createRendererManager(
    gpuCanvas: HTMLCanvasElement,
    cpuCanvas: HTMLCanvasElement
): RendererManager {
    let webglRenderer: WebGLRenderer | null = null;
    let apRenderer: ArbitraryPrecisionRenderer | null = null;
    let currentMode: RenderMode = 'gpu';

    let onModeChangeCallback: ((mode: RenderMode) => void) | null = null;
    let onProgressCallback: ((progress: RenderProgress) => void) | null = null;

    const initGPU = () => {
        if (!webglRenderer) {
            try {
                webglRenderer = new WebGLRenderer(gpuCanvas);
            } catch (e) {
                console.error('Failed to initialize WebGL renderer:', e);
            }
        }
    };

    const initCPU = () => {
        if (!apRenderer) {
            apRenderer = createArbitraryPrecisionRenderer(cpuCanvas);
            // Ensure the new renderer is sized to match the canvas
            apRenderer.resize(cpuCanvas.width, cpuCanvas.height);
            if (onProgressCallback) {
                apRenderer.setOnProgress(onProgressCallback);
            }
        }
    };

    const shouldUseGPU = (zoom: number): boolean => {
        return zoom < GPU_PRECISION_THRESHOLD;
    };

    const switchMode = (newMode: RenderMode) => {
        if (currentMode === newMode) return;

        // Cancel any in-progress CPU render
        if (currentMode === 'cpu' && apRenderer) {
            apRenderer.cancelRender();
        }

        currentMode = newMode;

        // Show/hide canvases
        gpuCanvas.style.display = newMode === 'gpu' ? 'block' : 'none';
        cpuCanvas.style.display = newMode === 'cpu' ? 'block' : 'none';

        if (onModeChangeCallback) {
            onModeChangeCallback(newMode);
        }
    };

    // Initialize GPU renderer by default
    initGPU();
    cpuCanvas.style.display = 'none';

    return {
        resize: (width: number, height: number) => {
            if (webglRenderer) {
                webglRenderer.resize(width, height);
            }
            if (apRenderer) {
                apRenderer.resize(width, height);
            }
            // Also resize the canvases themselves
            gpuCanvas.width = width;
            gpuCanvas.height = height;
            cpuCanvas.width = width;
            cpuCanvas.height = height;
        },

        render: (params: RenderParams | ArbitraryPrecisionRenderParams) => {
            const zoom = params.zoom;

            if (shouldUseGPU(zoom)) {
                switchMode('gpu');
                initGPU();
                if (webglRenderer) {
                    webglRenderer.render(params);
                }
            } else {
                switchMode('cpu');
                initCPU();
                if (apRenderer) {
                    // Cancel any in-progress render
                    apRenderer.cancelRender();
                    apRenderer.render(params);
                }
            }
        },

        dispose: () => {
            if (webglRenderer) {
                webglRenderer.dispose();
                webglRenderer = null;
            }
            if (apRenderer) {
                apRenderer.dispose();
                apRenderer = null;
            }
        },

        getCurrentMode: () => currentMode,

        setOnModeChange: (callback: (mode: RenderMode) => void) => {
            onModeChangeCallback = callback;
        },

        setOnProgress: (callback: (progress: RenderProgress) => void) => {
            onProgressCallback = callback;
            if (apRenderer) {
                apRenderer.setOnProgress(callback);
            }
        },

        cancelRender: () => {
            if (apRenderer) {
                apRenderer.cancelRender();
            }
        }
    };
}
