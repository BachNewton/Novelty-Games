export interface ColorPalette {
    id: string;
    name: string;
}

export const COLOR_PALETTES: ColorPalette[] = [
    { id: 'classic', name: 'Classic Blue' },
    { id: 'fire', name: 'Fire' },
    { id: 'rainbow', name: 'Rainbow' },
    { id: 'ocean', name: 'Ocean' },
    { id: 'monochrome', name: 'Monochrome' }
];

// Color palette implementations as string for web worker
export const COLOR_PALETTE_CODE = `
function getColor(paletteId, iteration, maxIterations) {
    if (iteration === maxIterations) {
        return [0, 0, 0]; // Black for points in the set
    }

    const t = iteration / maxIterations;

    switch (paletteId) {
        case 'classic':
            return getClassicColor(t);
        case 'fire':
            return getFireColor(t);
        case 'rainbow':
            return getRainbowColor(t);
        case 'ocean':
            return getOceanColor(t);
        case 'monochrome':
            return getMonochromeColor(t);
        default:
            return getClassicColor(t);
    }
}

function getClassicColor(t) {
    // Classic blue-based Mandelbrot coloring
    const r = Math.floor(9 * (1 - t) * t * t * t * 255);
    const g = Math.floor(15 * (1 - t) * (1 - t) * t * t * 255);
    const b = Math.floor(8.5 * (1 - t) * (1 - t) * (1 - t) * t * 255);
    return [r, g, b];
}

function getFireColor(t) {
    // Black -> Red -> Orange -> Yellow -> White
    if (t < 0.25) {
        const s = t * 4;
        return [Math.floor(s * 255), 0, 0];
    } else if (t < 0.5) {
        const s = (t - 0.25) * 4;
        return [255, Math.floor(s * 165), 0];
    } else if (t < 0.75) {
        const s = (t - 0.5) * 4;
        return [255, 165 + Math.floor(s * 90), 0];
    } else {
        const s = (t - 0.75) * 4;
        return [255, 255, Math.floor(s * 255)];
    }
}

function getRainbowColor(t) {
    // HSL to RGB with hue cycling
    const h = t * 360;
    const s = 1;
    const l = 0.5;
    return hslToRgb(h, s, l);
}

function getOceanColor(t) {
    // Deep blue -> Cyan -> White
    if (t < 0.5) {
        const s = t * 2;
        return [0, Math.floor(s * 128), Math.floor(64 + s * 191)];
    } else {
        const s = (t - 0.5) * 2;
        return [Math.floor(s * 255), Math.floor(128 + s * 127), 255];
    }
}

function getMonochromeColor(t) {
    const v = Math.floor(t * 255);
    return [v, v, v];
}

function hslToRgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r, g, b;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return [
        Math.floor((r + m) * 255),
        Math.floor((g + m) * 255),
        Math.floor((b + m) * 255)
    ];
}
`;

// Worker colors for visualization (which worker computed which tile)
export const WORKER_COLORS = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Mint
    '#F7DC6F'  // Gold
];
