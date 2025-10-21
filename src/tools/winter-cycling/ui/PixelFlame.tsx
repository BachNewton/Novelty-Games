import React, { useRef, useEffect } from "react";

type PixelFlameProps = {
    width?: number; // CSS width of the canvas container (px)
    height?: number; // CSS height of the canvas container (px)
    pixelSize?: number; // size of each pixel cell when upscaled (px)
    intensity?: number; // 0..1 how strong/big the flame seeding is
    color?: string; // base hue/hex for the flame (e.g. '#ff5a1a' or 'orange')
    smoothing?: number; // 0..1 how smooth the flame propagation is (higher -> smoother)
    style?: React.CSSProperties; // extra styles for the wrapper
    className?: string;
    children?: React.ReactNode; // element to sit in front of the flame
};

// PixelFlame: renders an automated pixel flame behind any child element.
// Implementation notes:
// - Uses a low-resolution offscreen grid (gridW x gridH). Each cell holds a "heat" value [0..1].
// - The bottom row is seeded randomly scaled by `intensity` each frame.
// - Heat propagates upward by averaging neighbor cells with a decay factor influenced by `smoothing`.
// - We draw the grid onto an offscreen canvas at low resolution, then draw that canvas onto the visible canvas
//   with imageSmoothingEnabled = false and CSS scaled up by `pixelSize` to obtain the pixelated look.
// - Color mapping uses a small gradient from dark transparent -> base color -> white/yellow at the hottest.

export default function PixelFlame({
    width = 150,
    height = 100,
    pixelSize = 4,
    intensity = 0.8,
    color = "#3498db",
    smoothing = 0.87,
    style,
    className,
    children,
}: PixelFlameProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const offRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const gridRef = useRef<Float32Array | null>(null);
    const gridWRef = useRef<number>(0);
    const gridHRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const dpr = Math.max(1, window.devicePixelRatio || 1);

        // compute low-res grid size based on pixelSize
        const gridW = Math.max(8, Math.floor(width / pixelSize));
        const gridH = Math.max(8, Math.floor(height / pixelSize));
        gridWRef.current = gridW;
        gridHRef.current = gridH;

        // create offscreen canvas with grid resolution
        const off = document.createElement("canvas");
        off.width = gridW;
        off.height = gridH;
        offRef.current = off;

        // size the visible canvas to be the upscaled offscreen canvas
        canvas.width = gridW * dpr;
        canvas.height = gridH * dpr;
        canvas.style.width = `${gridW * pixelSize}px`;
        canvas.style.height = `${gridH * pixelSize}px`;

        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = false;

        // initialize grid
        const grid = new Float32Array(gridW * gridH);
        gridRef.current = grid;

        // color palette: we generate N colors from 0..1 mapping
        const palette = makePalette(color, 256);

        let last = performance.now();

        function stepFrame(now: number) {
            const dt = Math.min(50, now - last);
            last = now;
            updateGrid(grid, gridW, gridH, intensity, smoothing, dt);
            renderGridToCanvas(grid, gridW, gridH, off, palette);
            // draw upscale
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
            rafRef.current = requestAnimationFrame(stepFrame);
        }

        rafRef.current = requestAnimationFrame(stepFrame);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [width, height, pixelSize, intensity, color, smoothing]);

    return (
        <div
            className={className}
            style={{
                position: "relative",
                width: `${width}px`,
                height: `${height}px`,
                overflow: "hidden",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...style,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    zIndex: 0,
                    pointerEvents: "none",
                    // make the canvas slightly blurred/softened if desired by user style
                }}
            />

            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                }}
            >
                {children}
            </div>
        </div>
    );
}

// ----------------------- Utility functions -----------------------

function updateGrid(
    grid: Float32Array,
    w: number,
    h: number,
    intensity: number,
    smoothing: number,
    dt: number
) {
    const baseSeed = Math.min(1, Math.max(0, intensity));
    const centerPeakX = w / 2;
    const leftPeakX = w / 4;
    const rightPeakX = w * (3 / 4);

    // Step 1: Seed the bottom row with three peaks.
    for (let x = 0; x < w; x++) {
        // --- Center Peak ---
        // Distance from the center peak, normalized to the peak's radius (w/2).
        const distCenter = Math.abs(x - centerPeakX) / (w / 2);
        // Parabolic falloff for a smooth peak shape. Strength is 1.0.
        const centerFactor = Math.pow(Math.max(0, 1 - distCenter), 2);

        // --- Left Peak ---
        // Distance from the left peak, normalized to its radius (w/4).
        const distLeft = Math.abs(x - leftPeakX) / (w / 4);
        // Smaller side peak with a strength of 0.7.
        const leftFactor = 0.7 * Math.pow(Math.max(0, 1 - distLeft), 2);

        // --- Right Peak ---
        // Distance from the right peak, normalized to its radius (w/4).
        const distRight = Math.abs(x - rightPeakX) / (w / 4);
        // Smaller side peak with a strength of 0.7.
        const rightFactor = 0.7 * Math.pow(Math.max(0, 1 - distRight), 2);

        // The final peak factor is the maximum of the three individual peaks.
        const peakFactor = Math.max(centerFactor, leftFactor, rightFactor);

        const idx = (h - 1) * w + x;

        // A random pulse, scaled by both the overall intensity and the final peakFactor.
        const rnd = Math.random();
        const power = Math.pow(rnd, 1.0 - baseSeed * 0.9 * peakFactor);

        // Apply the new heat value, ensuring it's influenced by the peak.
        grid[idx] = Math.max(grid[idx] * 0.8, power * baseSeed * peakFactor);
    }

    // step 2: propagate upwards
    // We'll compute new heat into a temporary array to avoid immediate overwrite
    const tmp = new Float32Array(w * h);
    const decay = 0.01 + (1 - smoothing) * 0.08; // lower decay = smoother
    for (let y = 0; y < h - 1; y++) {
        for (let x = 0; x < w; x++) {
            const i = y * w + x;

            // average neighbors below + some horizontal neighbors to create flicker
            let sum = 0;
            let count = 0;
            // below
            const below = (y + 1) * w + x;
            sum += grid[below];
            count++;
            // below-left
            if (x > 0) {
                sum += grid[below - 1];
                count++;
            }
            // below-right
            if (x < w - 1) {
                sum += grid[below + 1];
                count++;
            }
            // left and right
            if (x > 0) {
                sum += grid[y * w + x - 1] * 0.5;
                count += 0.5;
            }
            if (x < w - 1) {
                sum += grid[y * w + x + 1] * 0.5;
                count += 0.5;
            }
            let val = sum / count;
            // decay and some random jitter
            val -= decay * (0.5 + Math.random() * 0.8);
            // clamp
            if (val < 0) val = 0;
            if (val > 1) val = 1;
            tmp[i] = val;
        }
    }
    // Copy the seeded bottom row to the temporary array
    for (let x = 0; x < w; x++) {
        const idx = (h - 1) * w + x;
        tmp[idx] = grid[idx];
    }


    // copy back into grid
    grid.set(tmp);
}

function renderGridToCanvas(grid: Float32Array, w: number, h: number, canvas: HTMLCanvasElement, palette: Uint8ClampedArray) {
    const ctx = canvas.getContext("2d")!;
    const img = ctx.createImageData(w, h);
    const data = img.data;
    for (let i = 0; i < w * h; i++) {
        const v = Math.max(0, Math.min(1, grid[i]));
        // bias towards hotter colors
        const idx = Math.floor(v * (palette.length / 4 - 1)) * 4;
        data[i * 4 + 0] = palette[idx + 0];
        data[i * 4 + 1] = palette[idx + 1];
        data[i * 4 + 2] = palette[idx + 2];
        data[i * 4 + 3] = palette[idx + 3];
    }
    ctx.putImageData(img, 0, 0);
}

function makePalette(baseColor: string, size = 256) {
    // create a gradient from transparent -> deep -> base -> bright white/yellow
    // We'll build a canvas gradient to sample colors easily.
    const c = document.createElement("canvas");
    c.width = size;
    c.height = 1;
    const ctx = c.getContext("2d")!;

    // create gradient stops
    const g = ctx.createLinearGradient(0, 0, size, 0);
    // stops: 0.0 transparent black
    g.addColorStop(0.0, "rgba(0,0,0,0)");
    // .2 deep (dark) tone
    g.addColorStop(0.2, darken(baseColor, 0.6));
    // .5 base color
    g.addColorStop(0.5, baseColor);
    // .85 bright
    g.addColorStop(0.85, "#ffd27a");
    // 1.0 white
    g.addColorStop(1.0, "#ffffff");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, 1);

    const data = ctx.getImageData(0, 0, size, 1).data;
    return data;
}

// simple color darken assuming hex or rgb string - we'll try to parse hex
function darken(col: string, t: number) {
    // t in 0..1, 0 returns same, 1 returns black
    try {
        const { r, g, b } = parseColor(col);
        const nr = Math.round(r * (1 - t));
        const ng = Math.round(g * (1 - t));
        const nb = Math.round(b * (1 - t));
        return `rgb(${nr},${ng},${nb})`;
    } catch (e) {
        return col;
    }
}

function parseColor(input: string) {
    const s = input.trim().toLowerCase();
    if (s.startsWith("#")) {
        let hex = s.substring(1);
        if (hex.length === 3) {
            hex = hex.split("").map((c) => c + c).join("");
        }
        if (hex.length !== 6) throw new Error("Unsupported hex color");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return { r, g, b };
    }
    // rgb(...) pattern
    const m = s.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (m) {
        return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
    }
    throw new Error("Unsupported color format");
}
