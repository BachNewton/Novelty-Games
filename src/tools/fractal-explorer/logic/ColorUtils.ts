// Color palette functions - mirrors the GLSL shader logic

export function getColorForIteration(
    iterations: number,
    maxIterations: number,
    paletteId: string
): [number, number, number] {
    if (iterations >= maxIterations) {
        return [0, 0, 0];
    }

    const t = iterations / maxIterations;

    switch (paletteId) {
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

function getClassicColor(t: number): [number, number, number] {
    const r = 9 * (1 - t) * t * t * t;
    const g = 15 * (1 - t) * (1 - t) * t * t;
    const b = 8.5 * (1 - t) * (1 - t) * (1 - t) * t;
    return [
        Math.floor(r * 255),
        Math.floor(g * 255),
        Math.floor(b * 255)
    ];
}

function getFireColor(t: number): [number, number, number] {
    if (t < 0.25) {
        return [Math.floor(t * 4 * 255), 0, 0];
    } else if (t < 0.5) {
        const s = (t - 0.25) * 4;
        return [255, Math.floor(s * 0.65 * 255), 0];
    } else if (t < 0.75) {
        const s = (t - 0.5) * 4;
        return [255, Math.floor((0.65 + s * 0.35) * 255), 0];
    } else {
        const s = (t - 0.75) * 4;
        return [255, 255, Math.floor(s * 255)];
    }
}

function getRainbowColor(t: number): [number, number, number] {
    return hslToRgb(t * 360, 1, 0.5);
}

function getOceanColor(t: number): [number, number, number] {
    if (t < 0.5) {
        const s = t * 2;
        return [0, Math.floor(s * 0.5 * 255), Math.floor((0.25 + s * 0.75) * 255)];
    } else {
        const s = (t - 0.5) * 2;
        return [
            Math.floor(s * 255),
            Math.floor((0.5 + s * 0.5) * 255),
            255
        ];
    }
}

function getMonochromeColor(t: number): [number, number, number] {
    const v = Math.floor(t * 255);
    return [v, v, v];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

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
