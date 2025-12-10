export interface ViewportState {
    // Center of the view in the complex plane
    centerReal: number;
    centerImag: number;
    // Zoom level (pixels per unit in complex plane)
    zoom: number;
    // Canvas dimensions
    canvasWidth: number;
    canvasHeight: number;
}

export function createViewportState(
    centerReal: number,
    centerImag: number,
    zoom: number,
    canvasWidth: number,
    canvasHeight: number
): ViewportState {
    return { centerReal, centerImag, zoom, canvasWidth, canvasHeight };
}

// Convert screen coordinates to complex plane coordinates
export function screenToComplex(
    viewport: ViewportState,
    screenX: number,
    screenY: number
): { real: number; imag: number } {
    const real = viewport.centerReal + (screenX - viewport.canvasWidth / 2) / viewport.zoom;
    const imag = viewport.centerImag + (screenY - viewport.canvasHeight / 2) / viewport.zoom;
    return { real, imag };
}

// Convert complex plane coordinates to screen coordinates
export function complexToScreen(
    viewport: ViewportState,
    real: number,
    imag: number
): { x: number; y: number } {
    const x = (real - viewport.centerReal) * viewport.zoom + viewport.canvasWidth / 2;
    const y = (imag - viewport.centerImag) * viewport.zoom + viewport.canvasHeight / 2;
    return { x, y };
}

// Get the complex plane bounds for the current viewport
export function getViewportBounds(viewport: ViewportState): {
    realMin: number;
    realMax: number;
    imagMin: number;
    imagMax: number;
} {
    const halfWidth = viewport.canvasWidth / 2 / viewport.zoom;
    const halfHeight = viewport.canvasHeight / 2 / viewport.zoom;

    return {
        realMin: viewport.centerReal - halfWidth,
        realMax: viewport.centerReal + halfWidth,
        imagMin: viewport.centerImag - halfHeight,
        imagMax: viewport.centerImag + halfHeight
    };
}

// Pan the viewport by screen pixel delta
export function panViewport(
    viewport: ViewportState,
    deltaX: number,
    deltaY: number
): ViewportState {
    return {
        ...viewport,
        centerReal: viewport.centerReal - deltaX / viewport.zoom,
        centerImag: viewport.centerImag - deltaY / viewport.zoom
    };
}

// Zoom the viewport centered on a screen point
export function zoomViewport(
    viewport: ViewportState,
    zoomFactor: number,
    screenX: number,
    screenY: number
): ViewportState {
    // Get the complex coordinates under the mouse before zoom
    const complexBefore = screenToComplex(viewport, screenX, screenY);

    // Apply zoom
    const newZoom = viewport.zoom * zoomFactor;

    // Clamp zoom to reasonable bounds
    const clampedZoom = Math.max(10, Math.min(newZoom, 1e15));

    // Calculate new center to keep the point under the mouse stationary
    const newCenterReal = complexBefore.real - (screenX - viewport.canvasWidth / 2) / clampedZoom;
    const newCenterImag = complexBefore.imag - (screenY - viewport.canvasHeight / 2) / clampedZoom;

    return {
        ...viewport,
        centerReal: newCenterReal,
        centerImag: newCenterImag,
        zoom: clampedZoom
    };
}

// Resize the viewport while keeping the center fixed
export function resizeViewport(
    viewport: ViewportState,
    newWidth: number,
    newHeight: number
): ViewportState {
    return {
        ...viewport,
        canvasWidth: newWidth,
        canvasHeight: newHeight
    };
}
