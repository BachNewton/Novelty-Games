// Viewport state management for the world map

export interface Viewport {
    centerX: number;
    centerY: number;
    zoom: number;  // pixels per world unit
}

export interface ViewportBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

export function createViewport(centerX = 0, centerY = 0, zoom = 1): Viewport {
    return { centerX, centerY, zoom };
}

export function getViewportBounds(viewport: Viewport, canvasWidth: number, canvasHeight: number): ViewportBounds {
    const halfWidth = canvasWidth / (2 * viewport.zoom);
    const halfHeight = canvasHeight / (2 * viewport.zoom);

    return {
        minX: viewport.centerX - halfWidth,
        maxX: viewport.centerX + halfWidth,
        minY: viewport.centerY - halfHeight,
        maxY: viewport.centerY + halfHeight
    };
}

export function panViewport(viewport: Viewport, deltaScreenX: number, deltaScreenY: number): Viewport {
    // Convert screen delta to world delta
    const worldDeltaX = -deltaScreenX / viewport.zoom;
    const worldDeltaY = deltaScreenY / viewport.zoom;  // Y is inverted (screen Y down, world Y up)

    return {
        ...viewport,
        centerX: viewport.centerX + worldDeltaX,
        centerY: viewport.centerY + worldDeltaY
    };
}

export function zoomViewportAt(
    viewport: Viewport,
    factor: number,
    screenX: number,
    screenY: number,
    canvasWidth: number,
    canvasHeight: number
): Viewport {
    // Calculate world position under cursor before zoom
    const worldX = viewport.centerX + (screenX - canvasWidth / 2) / viewport.zoom;
    const worldY = viewport.centerY - (screenY - canvasHeight / 2) / viewport.zoom;

    // Apply zoom
    const newZoom = viewport.zoom * factor;

    // Clamp zoom to reasonable bounds
    const clampedZoom = Math.max(0.1, Math.min(1000, newZoom));

    // Calculate new center to keep point under cursor
    const newCenterX = worldX - (screenX - canvasWidth / 2) / clampedZoom;
    const newCenterY = worldY + (screenY - canvasHeight / 2) / clampedZoom;

    return {
        centerX: newCenterX,
        centerY: newCenterY,
        zoom: clampedZoom
    };
}

export function worldToScreen(
    worldX: number,
    worldY: number,
    viewport: Viewport,
    canvasWidth: number,
    canvasHeight: number
): { screenX: number; screenY: number } {
    const screenX = canvasWidth / 2 + (worldX - viewport.centerX) * viewport.zoom;
    const screenY = canvasHeight / 2 - (worldY - viewport.centerY) * viewport.zoom;
    return { screenX, screenY };
}

export function screenToWorld(
    screenX: number,
    screenY: number,
    viewport: Viewport,
    canvasWidth: number,
    canvasHeight: number
): { worldX: number; worldY: number } {
    const worldX = viewport.centerX + (screenX - canvasWidth / 2) / viewport.zoom;
    const worldY = viewport.centerY - (screenY - canvasHeight / 2) / viewport.zoom;
    return { worldX, worldY };
}
