# World Explorer

A procedurally generated infinite world map viewer with a vintage cartography aesthetic.

## Overview

World Explorer generates an endless world using multi-octave simplex noise for terrain, biomes, rivers, cities, and roads. The map is divided into 64x64 tile chunks that are generated on-demand and cached.

## Architecture

```
world-explorer/
├── ui/
│   ├── WorldExplorerPage.tsx  - Route entry point
│   ├── Home.tsx               - State container (seed, coordinates)
│   ├── WorldCanvas.tsx        - Main canvas rendering + input handling
│   └── ControlPanel.tsx       - UI controls
├── logic/
│   ├── Viewport.ts            - Camera pan/zoom math
│   ├── WorldGenerator.ts      - Chunk generation orchestrator
│   ├── TerrainGenerator.ts    - Multi-octave noise terrain
│   ├── Noise.ts               - Simplex noise implementation
│   ├── BiomeClassifier.ts     - Elevation/moisture → biome mapping
│   ├── NameGenerator.ts       - Procedural place names by region style
│   ├── SeededRandom.ts        - Mulberry32 PRNG
│   ├── TerrainDetailRenderer.ts - Zoom-dependent hillshade & textures
│   └── BiomeFeatureRenderer.ts  - Trees, rocks, coastlines at high zoom
├── workers/
│   ├── ChunkWorker.ts         - Web Worker for async chunk generation
│   └── ChunkWorkerClient.ts   - Main thread worker interface
└── data/
    ├── ChunkTypes.ts          - Data structures (Chunk, Tile, City, etc.)
    └── Biomes.ts              - Biome color definitions
```

## Performance Optimizations

### Implemented

- **Web Worker generation**: Chunks are generated off the main thread, preventing UI blocking
- **Shimmer placeholders**: Visual feedback while chunks load
- **Tile stride LOD**: At medium zoom, renders every 2nd/4th/8th tile to reduce work
- **Low-detail terrain cache**: At very low zoom (<0.5), samples terrain directly at screen pixels
- **Chunk caching**: Up to 200 chunks stored, LRU eviction
- **Viewport culling**: Tiles and labels outside screen bounds are skipped
- **Progressive detail**: Rivers, roads, buildings only rendered at appropriate zoom levels
- **Gradient caching**: Background gradient created once per canvas size
- **Zoom-dependent terrain detail**: Hillshade, textures, and features progressively appear as you zoom in

### Zoom-Dependent Detail System

Two renderers add progressive visual detail:

**TerrainDetailRenderer** (color/shading):
| Zoom | Effect |
|------|--------|
| 2+ | Hillshade - northwest lighting creates 3D terrain depth |
| 8+ | Micro-variation - fine-scale noise adds organic color texture |
| 20+ | Biome textures - ripples, spots, streaks per biome type |

**BiomeFeatureRenderer** (visible features):
| Biome | Feature | Min Zoom |
|-------|---------|----------|
| Forest/Jungle | Trees (triangles with trunks) | 8 |
| Mountains | Rocks/boulders (irregular shapes) | 8 |
| Hills | Shrubs (overlapping circles) | 10 |
| Desert | Cacti (saguaro style) | 12 |
| Plains | Grass tufts | 15 |
| Swamp | Reeds/cattails | 10 |
| Water edges | Coastline waves + foam | 10 |

Features use procedural noise placement (deterministic per seed) and scale with zoom level.

### Current Performance Characteristics

| Zoom Range | Rendering Mode | Details Shown |
|------------|---------------|---------------|
| < 0.5 | Low-detail cache | Sampled terrain only |
| 0.5 - 2 | Stride 4-8 tiles | Basic terrain |
| 2 - 4 | Stride 2 tiles | + Hillshade, rivers, city markers |
| 4 - 8 | Full tiles | + Roads, rail, city boundaries |
| 8 - 20 | Full detail | + Micro-textures, trees, rocks, coastline waves |
| 20+ | Maximum detail | + Biome textures, grass, cacti, detailed trees |

## Potential Improvements

### Performance

1. **A* Priority Queue**: Replace `openSet.sort()` with binary heap for road pathfinding
   - Currently O(n²log n), could be O(n log n)
   - Location: `WorldGenerator.ts:458`

2. **LRU Eviction Fix**: Track oldest chunk key separately instead of `keys().next()`
   - Minor but avoids Map iteration

3. **Multiple Workers**: Use 2-4 workers for parallel chunk generation during fast panning

4. **Predictive Loading**: Pre-generate chunks in direction of pan movement

### Visual Quality

5. **Smooth Chunk Transitions**: Anti-alias chunk edges or blend newly loaded chunks

6. **Improved Roads**: Curved roads using Bezier paths instead of A* grid paths

7. **City Improvements**:
   - Named districts within large cities
   - Varying building heights/styles
   - Parks, plazas, landmarks

### Features

8. **Search**: Find cities/regions by name
9. **Bookmarks**: Save interesting locations
10. **Export**: Save map sections as images
11. **Day/Night Cycle**: Time-based lighting changes
12. **Points of Interest**: Ruins, temples, natural wonders

## Technical Notes

### Web Worker Constraints

The chunk worker bundles all generation code inline because:
- Workers can't share objects with main thread
- Chunk data is plain serializable objects (tiles, cities, labels)
- Trade-off: ~1200 lines duplicated, but keeps architecture simple

### Noise Generation

Uses simplex noise with multiple octaves:
- Continent scale (0.002): Large landmass shapes
- Mountain scale (0.015): Ridge patterns (ridged noise)
- Detail scale (0.08): Local terrain variation
- Separate noise for moisture and temperature

### Coordinate System

- World coordinates: Continuous floating point (origin at 0,0)
- Chunk coordinates: Integer grid (chunk at 0,0 covers tiles 0-63)
- Screen coordinates: Canvas pixels (origin at top-left)
- Viewport: Centers on world coordinate with zoom (pixels per world unit)
