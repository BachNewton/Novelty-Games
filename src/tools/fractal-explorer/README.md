# Fractal Explorer

An interactive fractal visualization tool with dual-renderer architecture supporting both GPU (WebGL) and CPU (arbitrary precision) rendering for exploring fractals at extreme zoom levels.

## Directory Structure

```
fractal-explorer/
├── data/
│   ├── FractalTypes.ts           # Fractal configurations & defaults
│   ├── ColorPalettes.ts          # Color palette definitions
│   └── TourData.ts               # Guided tour waypoints
├── logic/
│   ├── ArbitraryCoordinate.ts    # High-precision coordinate system (Decimal.js)
│   ├── ArbitraryPrecisionRenderer.ts  # CPU-based multi-pass renderer
│   ├── ColorUtils.ts             # Color calculation & LUT generation
│   ├── Easing.ts                 # Animation easing functions
│   ├── FractalRenderer.ts        # Render interfaces & types
│   ├── RendererManager.ts        # GPU/CPU renderer switching
│   ├── TourAnimator.ts           # Three-phase animation engine
│   ├── TourController.ts         # Tour state management
│   └── WebGLRenderer.ts          # WebGL-based GPU renderer
├── ui/
│   ├── FractalExplorerPage.tsx   # Entry point (route wrapper)
│   ├── Home.tsx                  # Main UI with settings state
│   ├── FractalCanvas.tsx         # Canvas & interaction handler
│   ├── ControlPanel.tsx          # Settings sidebar
│   ├── TourControls.tsx          # Tour navigation HUD
│   └── ZoomIndicator.tsx         # HUD (zoom, mode, progress)
└── workers/
    ├── FractalWorkerMessages.ts  # Worker message types
    └── fractalWorker.ts          # Web Worker for CPU computation
```

## Architecture Overview

```
FractalCanvas (user input: pan/zoom/settings)
    │
    ├─→ RendererManager (decides renderer)
    │   ├─→ WebGLRenderer (GPU, zoom < 1e7)
    │   └─→ ArbitraryPrecisionRenderer (CPU, zoom >= 1e7)
    │
    ├─→ ViewPort State (ArbitraryCoordinate with Decimal.js)
    │
    └─→ ZoomIndicator (HUD feedback)
```

### Key Design Decisions

1. **Automatic Precision Switching**: GPU (single-precision floats) switches to CPU (Decimal.js) when zoom exceeds `1e7` to maintain visual accuracy
2. **Progressive Rendering**: CPU renderer uses 4 passes (8x → 4x → 2x → 1x step sizes) for interactive preview during long computations
3. **Multi-threaded**: CPU renderer spawns Web Workers equal to `navigator.hardwareConcurrency`
4. **Pan/Zoom Preview**: Captures and transforms previous render while computing for immediate visual feedback

## Supported Fractals

| Type | Formula | Description |
|------|---------|-------------|
| **Mandelbrot** | z = z² + c | Classic set; z starts at 0, pixel position is c |
| **Julia** | z = z² + c (c fixed) | Pixel is starting z, c is a constant parameter |
| **Burning Ship** | z = (\|Re(z)\| + i·\|Im(z)\|)² + c | Absolute value variant |
| **Tricorn** | z = conj(z)² + c | Complex conjugate variant |

## Rendering

### GPU Rendering (WebGL)

**File:** `logic/WebGLRenderer.ts`

- Single-pass fragment shader computes all pixels in parallel
- Max 10,000 iterations (GLSL requires compile-time loop bounds, so the shader uses a fixed 10k loop with early exit)
- Smooth coloring formula: `smoothIter = iter - log₂(log₂(mag²)) + 4`
- 5 color palettes implemented in GLSL
- Precision limit: ~1e7 zoom (single-precision float degradation)

### CPU Rendering (Arbitrary Precision)

**File:** `logic/ArbitraryPrecisionRenderer.ts`

Uses multi-pass progressive rendering:

```
Pass 0: Every 8th pixel    (1/64 coverage, fast preview)
Pass 1: Every 4th pixel    (fills gaps)
Pass 2: Every 2nd pixel    (more detail)
Pass 3: Every pixel        (final quality)
```

**Optimizations:**
- **Buffer reuse for pans**: Shifts iteration buffer instead of recomputing when only panning
- **Zoom transform preview**: Scales captured canvas while computing
- **Dual precision**: Uses fast floats until zoom > 1e16, then Decimal.js
- **Color LUT**: Pre-computed RGB for all iteration counts

### Worker Communication

**Files:** `workers/fractalWorker.ts`, `workers/FractalWorkerMessages.ts`

1. Coordinator sends `COMPUTE_PIXELS` with pixel coordinates and parameters as strings
2. Workers batch-compute iterations, sending `PROGRESS` every 200ms
3. Workers return `PIXELS_RESULT` with `[x, y, iterations, magnitude]`
4. Coordinator renders to canvas in 20k pixel chunks (prevents UI freeze)

## Key Interfaces

### ArbitraryCoordinate

```typescript
interface ArbitraryCoordinate {
    real: Decimal;   // Center X
    imag: Decimal;   // Center Y
    zoom: Decimal;   // Pixels per unit
}

pan(coord, deltaX, deltaY)                      // Pan by pixel offset
zoomAt(coord, factor, screenX, screenY, w, h)   // Zoom at screen point
```

### RenderParams

```typescript
interface RenderParams {
    centerReal, centerImag, zoom: number;
    maxIterations: number;
    fractalType: FractalType;
    paletteId: string;
    juliaReal, juliaImag: number;
}
```

### RendererManager

```typescript
interface RendererManager {
    resize(w, h): void;
    render(params): void;
    dispose(): void;
    getCurrentMode(): 'gpu' | 'cpu';
    setOnModeChange(callback): void;
    setOnProgress(callback): void;
    cancelRender(): void;
}
```

## User Interactions

| Input | Action |
|-------|--------|
| **Mouse drag** | Pan viewport |
| **Scroll wheel** | Zoom at cursor (1.2x per tick) |
| **Touch drag** | Pan (mobile) |
| **Pinch** | Zoom at center (mobile) |
| **Fractal selector** | Switch type, resets to default view |
| **Palette selector** | Change colors, re-renders |
| **Tour button** | Start guided tour through famous fractal locations |

## Performance Characteristics

| Zoom Level | Renderer | Speed |
|------------|----------|-------|
| 1 - 1e7 | WebGL (GPU) | Instant |
| 1e7 - 1e16 | CPU (floats) | 1-10 sec |
| > 1e16 | CPU (Decimal.js) | 10-60+ sec |
| Pan only (CPU) | Buffer shift | < 100ms |

## Color Palettes

- **Classic**: Blue-white gradient
- **Fire**: Black-red-yellow-white
- **Rainbow**: Full spectrum cycle
- **Ocean**: Blue-cyan-white
- **Monochrome**: Grayscale

## Guided Tour

A guided tour feature takes users on a "math adventure" through famous locations in the Mandelbrot set, demonstrating both GPU and CPU rendering capabilities.

### Tour Stops (Mandelbrot Journey)

| # | Name | Coordinates | Zoom | Renderer |
|---|------|-------------|------|----------|
| 1 | The Full Set | (-0.5, 0) | 250 | GPU |
| 2 | Seahorse Valley | (-0.75, 0.1) | 2,000 | GPU |
| 3 | Seahorse Tail | (-0.7463, 0.1102) | 50,000 | GPU |
| 4 | Elephant Valley | (0.27205, 0.00612) | 3,000 | GPU |
| 5 | Elephant Deep | (0.272172, 0.005725) | 5e6 | GPU |
| 6 | Deep Spiral | (-0.7436439, 0.1318259) | 5e8 | CPU (float) |
| 7 | Hidden Minibrot | (-1.749024499891772, 0.0) | 1e12 | CPU (float) |
| 8 | Infinite Depth | (-0.7436438870371587, 0.1318259042053119) | 1e17 | CPU (Decimal.js) |

### Animation System

The tour uses a three-phase "Google Earth" style animation between stops:

```
Phase 1 - Zoom Out (1s):
  Logarithmic zoom decrease to transit level
  Position stays at start

Phase 2 - Pan (1.5s):
  Linear position interpolation
  Zoom stays at transit level

Phase 3 - Zoom In (1.5s):
  Logarithmic zoom increase to destination
  Position stays at end
```

Zoom is interpolated logarithmically for perceptually uniform speed:
```typescript
currentZoom = exp(lerp(log(fromZoom), log(toZoom), t))
```

### Tour Controls

- **Previous/Next buttons**: Navigate between stops
- **Dot navigation**: Click any dot to jump to that stop
- **Auto-advance**: Automatically proceed after 5 seconds at each stop
- **Full interactivity**: Pan/zoom freely during tour; tour provides waypoints

### Animation During CPU Rendering

Animation runs at 60fps regardless of renderer mode. During transitions to deep-zoom stops:
- GPU renders keep up with every frame
- CPU renders show progressive/incomplete results during fast animation
- When animation stops at a waypoint, CPU completes the full-quality render

## Implementation Details

### Smooth Coloring

Both renderers use the same formula for anti-aliased gradients:
```
smoothIter = iter - log₂(log₂(magnitude²)) + 4
```

### Dynamic Precision

CPU workers adjust Decimal.js precision based on zoom:
```typescript
const precision = Math.max(30, Math.ceil(log10(zoom) * 1.5) + 20);
```

### Render ID Tracking

Prevents stale results from outdated renders:
```typescript
currentRenderId++;  // Incremented on each new render request
// Workers ignore results where message.renderId !== currentRenderId
```

### Iteration Buffers

```typescript
iterationBuffer: Int32Array    // -1 (not computed), 0..maxIter
magnitudeBuffer: Float32Array  // For smooth coloring interpolation
```

## Why Not Emulated Double Precision on GPU?

An attempt was made to extend GPU rendering range using emulated double precision (representing one high-precision number with multiple float32 values). This work exists in the abandoned `fractal-gpu` branch. It didn't work, and here's why.

### The Approach

Extended precision arithmetic uses the **two-sum algorithm** to capture rounding errors:

```glsl
float s = a + b;                      // Sum (loses precision)
float v = s - a;                      //
float e = (a - (s - v)) + (b - v);    // Recovers the lost bits
// Result: s + e exactly equals a + b
```

### Why It Failed

GPU shader compilers aggressively optimize using algebraic identities. The compiler sees `(s - v)` where `s = a + b` and `v = s - a`, and legally simplifies:

```
(s - v) = ((a + b) - ((a + b) - a)) = a
```

This is mathematically correct in infinite precision, but it **destroys the error-tracking mechanism**. The error term `e` becomes zero, leaving only single-precision despite all the extra arithmetic.

### What Was Tried

| Approach | Result |
|----------|--------|
| Double-single (2 floats) | Error terms optimized to zero |
| Quad precision (4 floats) | Same problem |
| Octal precision (8 floats) | Same problem |
| Anti-optimization tricks (`mix()`, uniform multiplication) | Compiler saw through them |
| WebGL 2.0 `precise` qualifier | Not available (requires GLSL ES 3.20, WebGL 2.0 only has 3.00) |
| WebGPU/WGSL | Same compiler optimizations |

All approaches rendered identically with visible pixelation at deep zooms.

### The Insight

> GPU shader compilers are "too smart" - they correctly apply mathematical identities that would be valid in infinite precision, but those transformations break algorithms designed to exploit finite-precision rounding behavior.

### Future Alternatives

- **Perturbation theory**: Compute a reference orbit at center with CPU arbitrary precision, then compute pixel offsets using deltas. This is how professional tools like Kalles Fraktaler achieve deep zooms.
- **Compute shaders with explicit memory**: Operations that can't be optimized away.

For now, the simpler CPU fallback with Decimal.js provides correct results at the cost of speed.
