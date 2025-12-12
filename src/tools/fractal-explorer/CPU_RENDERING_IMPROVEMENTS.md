# Fractal Explorer CPU Rendering Improvements

## Problems Identified

1. **UI lag during rendering** - `renderToCanvas()` blocks main thread
2. **Slow at deep zooms** - Always uses Decimal.js even when 64-bit floats suffice
3. **Color conversion overhead** - `getColorForIteration()` called per-pixel with no caching
4. **No pixel reuse on pan** - Buffer cleared entirely on every movement
5. **Redundant precision config** - `configurePrecision()` called per worker batch
6. **Inefficient progress reporting** - Messages every 100 pixels regardless of compute time

---

## Implementation Plan

### Phase 1: Quick Wins (Low complexity, immediate impact)

**1.1 Color Lookup Table**
- File: `logic/ColorUtils.ts`
  - Add `createColorLUT(maxIterations, paletteId)` function
  - Returns `Uint8Array` with precomputed RGB values
- File: `logic/ArbitraryPrecisionRenderer.ts`
  - Cache LUT in closure, regenerate when palette/maxIterations change
  - Replace `getColorForIteration()` calls with direct array lookups

**1.2 Cache Precision Configuration**
- File: `workers/fractalWorker.ts`
  - Add `cachedZoomStr` variable
  - Only call `Decimal.set()` when zoom actually changes

**1.3 Time-Based Progress Reporting**
- File: `workers/fractalWorker.ts`
  - Replace pixel-count progress (every 100) with time-based (every 200ms)
  - Reduces message overhead by ~95%

### Phase 2: Fix UI Lag

**2.1 Chunked Canvas Updates**
- File: `logic/ArbitraryPrecisionRenderer.ts`
  - Refactor `renderToCanvas()` to process pixels in chunks
  - Use `requestAnimationFrame` between chunks
  - Keep main thread responsive during large canvas updates

### Phase 3: Major Performance Boost

**3.1 Dual-Precision Mode (Float + Decimal)**
- File: `workers/fractalWorker.ts`
  - Add float-based computation functions (`computeMandelbrotFloat`, etc.)
  - Use native JS numbers when zoom < 1e14 (64-bit float has ~15 digits precision)
  - Fall back to Decimal.js only for extreme zooms (>1e14)
- Expected: **10-100x speedup** for zoom range 3e7 to 1e14

### Phase 4: Pan Optimization

**4.1 Pixel Carryover on Pan**
- File: `logic/ArbitraryPrecisionRenderer.ts`
  - Track previous center/zoom
  - On pan (same zoom), shift existing buffer instead of clearing
  - Only compute newly visible edge pixels
  - Modify `getPixelsForPass()` to skip already-computed pixels

---

## Files to Modify

| File | Changes |
|------|---------|
| `logic/ColorUtils.ts` | Add LUT generation |
| `logic/ArbitraryPrecisionRenderer.ts` | LUT usage, chunked render, pan carryover |
| `workers/fractalWorker.ts` | Float mode, precision cache, progress timing |

---

## Implementation Order

1. Color LUT (Phase 1.1)
2. Precision caching (Phase 1.2)
3. Progress timing (Phase 1.3)
4. Chunked canvas updates (Phase 2.1)
5. Dual-precision mode (Phase 3.1)
6. Pan pixel carryover (Phase 4.1)

---

## Expected Impact

| Optimization | Impact |
|-------------|--------|
| Color LUT | ~20-30% speedup for `renderToCanvas()` |
| Precision caching | Minor speedup, cleaner code |
| Time-based progress | 95% reduction in worker messages |
| Chunked canvas | **Eliminates UI lag** |
| Dual-precision mode | **10-100x speedup** for zoom 3e7 to 1e14 |
| Pan carryover | Major speedup for pan operations |
