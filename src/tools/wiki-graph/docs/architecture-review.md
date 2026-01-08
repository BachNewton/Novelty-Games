# Wiki-Graph Architecture Review

Post-cleanup code review with recommendations for future improvements.

## Cleanup Completed (January 2026)

| Goal | What Was Done |
|------|---------------|
| Remove unused code/files | Deleted `LinkFactory.ts`, `NodeFactory.ts`, removed `CrawlState` interface |
| Extract magic numbers to config | Created 9 config files organized by feature (nodeConfig, linkConfig, sceneConfig, etc.) |
| Reduce code duplication | Created `troikaLabelUtils.ts` to consolidate label creation |
| Reduce excessive nesting | Extracted `promoteLeafToFullNode()` and `createNewArticleNode()` from 92-line callback |
| Review/update comments | Verified all comments accurate; found and fixed `CONFIG` -> `NODE_CONFIG` bug |
| Fix O(n²) cone orientation | Replaced `links.find()` with pre-built Map lookup in animation loop |
| Replace CSS2D with troika-three-text | Switched from DOM-based labels to GPU-rendered SDF text |

**Files deleted**: 3 (LinkFactory.ts, NodeFactory.ts, labelUtils.ts)
**Files created**: 11 (9 config files + troikaLabelUtils.ts + troika type declarations)
**Files modified**: 15

## Performance Improvements

### Labels: CSS2D to Troika Migration

**Problem**: CSS2DRenderer created a DOM element per label. At 1000 nodes, this caused severe layout thrashing—dropping to 9 FPS with only 15% CPU/GPU usage (browser blocked on DOM operations).

**Solution**: Replaced with troika-three-text (SDF-based GPU text rendering).

**Results at 1000 nodes (physics disabled):**
| Label System | FPS | Cost vs baseline |
|--------------|-----|------------------|
| None | 60 | - |
| CSS2D | 9 | -51 FPS |
| Troika | 28 | -32 FPS |

Troika is 3x faster than CSS2D. The remaining 32 FPS cost comes from per-frame updates (position, quaternion for billboarding, opacity for distance fade).

### Cone Orientation: O(n²) to O(n)

**Problem**: Each frame called `links.find()` inside the node loop to orient cone meshes—O(articles × links) complexity.

**Solution**: Build a lookup Map once per frame, then O(1) lookups.

```typescript
// Before: O(n²)
const incomingLink = links.find(l => l.target === title && l.linkType === 'directional');

// After: O(n)
const directionalLinkSources = new Map<string, string>();
for (const link of links) {
    if (link.linkType === 'directional') {
        directionalLinkSources.set(link.target, link.source);
    }
}
// Then O(1) lookup per cone
const sourceTitle = directionalLinkSources.get(title);
```

## Current Strengths

1. **Factory Function Pattern** - Consistently applied per CLAUDE.md guidelines
2. **Clear Directory Structure** - config/, data/, hooks/, logic/, scene/, ui/, util/
3. **Good TypeScript Usage** - Proper interfaces, no `any` types, union types for variants
4. **Instanced Mesh Implementation** - Correct batching and GPU updates
5. **GPU-based Labels** - Troika SDF text scales better than DOM elements

## Architectural Issues

### 1. Duplicated Position State

`ArticleNode` stores `position` and `velocity` (`Article.ts:22-23`), but `ForceSimulation` maintains its own copy in `SimNode` (`ForceSimulation.ts:14-18`). Every frame copies simulation position to node position (`useAnimationLoop.ts:87-89`):

```typescript
const pos = simulation.getPosition(title);
if (pos) {
    node.position.copy(pos);
```

**Impact**: Memory overhead, potential sync bugs, confusing data ownership.

**Fix**: Remove `position`/`velocity` from `ArticleNode`. Access via `simulation.getPosition(title)` everywhere.

### 2. Ref-Heavy Architecture

`Home.tsx` creates 7 refs passed through hooks as mutable global state:

```typescript
const articlesRef = useRef<Map<string, ArticleNode>>(new Map());
const linksRef = useRef<ArticleLink[]>([]);
const pendingLinksRef = useRef<Map<string, Set<string>>>(new Map());
const loadingIndicatorsRef = useRef<Map<string, LoadingIndicator>>(new Map());
const linkCountsRef = useRef<Map<string, LinkCount>>(new Map());
const selectedArticleRef = useRef<string | null>(START_ARTICLE);
const statsLabelRef = useRef<Text | null>(null);
```

**Impact**: Hard to trace data flow, prevents React re-renders, implicit dependencies, untestable.

**Fix**: Create a dedicated `GraphState` container managed outside React (context + reducer, or Zustand).

### 3. Business Logic in Hooks

`useCrawlerSubscriptions` (332 lines) handles:
- 6 event subscriptions
- Loading indicators
- Node/link creation
- Leaf promotion
- Simulation sync
- UI state updates

**Impact**: Untestable, hard to reason about, React lifecycle tangled with business logic.

**Fix**: Extract a plain TypeScript `GraphController` that owns all graph mutation logic with no React dependencies.

### 4. Non-Null Assertions

Patterns throughout the codebase assume refs/maps are always populated:

```typescript
const articles = articlesRef.current!;  // useCrawlerSubscriptions.ts
const data = meshes.get(type)!;         // InstancedLinkManager.ts
nodes.get(nodeIds[i])!;                 // ForceSimulation.ts
```

**Impact**: Silent runtime failures if assumptions break.

**Fix**: Use early returns with null checks, or document why assertion is safe.

### 5. O(n²) Physics

`ForceSimulation.applyRepulsionForces` compares every node pair. With 1000 nodes, that's ~500,000 comparisons per frame.

**Impact**: At 1000 nodes, physics alone costs ~25 FPS.

**Fix**: Implement Barnes-Hut algorithm (octree-based O(n log n)) or use d3-force-3d.

## Label Optimization Investigation (January 2026)

### The Benchmark Artifact

Initial testing showed 27 FPS at 1000 nodes with physics disabled, suggesting label rendering was expensive. However, this was a **benchmark artifact**—all nodes were clustered in a small area due to `initialSpawnRange: 20`.

When nodes spawn spread out (as they do in real usage), FPS jumped to 100.

### Why Distance Culling Already Works

Labels beyond `MAX_LABEL_DISTANCE` (~52 units) are set to `visible = false`, which skips the draw call entirely:

```typescript
if (distance < MAX_LABEL_DISTANCE) {
    label.visible = true;
    // ... update position, quaternion, opacity
} else {
    label.visible = false;  // No draw call
}
```

The "fix" was ensuring nodes naturally spread out:
- New nodes now spawn near their parent (not at origin)
- Graph expands organically as it grows
- Distant labels automatically hidden by existing culling

### Optimizations Tested (No Significant Impact)

| Optimization | Result | Why |
|--------------|--------|-----|
| Quaternion batching | No change | `quaternion.copy()` is cheap (4 floats) |
| Frustum culling | Only helps when zoomed in | Most labels on-screen in typical view |

### The Real Bottleneck: Draw Calls

At 1000 clustered labels: 12% CPU, 35% GPU, 27 FPS. Low utilization with poor FPS indicates **draw call overhead**, not compute.

- Nodes: 3 instanced meshes = 3 draw calls ✓
- Links: 2 instanced meshes = 2 draw calls ✓
- Labels: 1000 Text meshes = **1000 draw calls** ✗

Each Troika Text is a separate mesh. This is architectural—text content varies per label, preventing traditional instancing.

### Future: If More Simultaneous Labels Needed

If requirements change and we need 1000+ visible labels at once:

1. **@pmndrs/uikit** - "Everything is instanced, every glyph" - single draw call
2. **Custom instanced characters** - SDF texture atlas + instanced planes per character (~60 draw calls for A-Z, a-z, 0-9)
3. **LOD approach** - Full labels nearby, colored dots for distant nodes

For current use cases, the existing distance culling is sufficient.

## Priority Recommendations

| Priority | Change | Effort | Impact |
|----------|--------|--------|--------|
| 1 | Extract `GraphController` from hooks | Medium | High |
| 2 | Remove duplicate position/velocity from `ArticleNode` | Low | High |
| 3 | Create centralized `GraphState` type | Low | Medium |
| 4 | Replace O(n²) physics with Barnes-Hut | High | Medium |

## Summary

The codebase is functional and maintainable at current scope. Performance work has addressed the main bottlenecks:
- **Labels**: CSS2D → Troika (3x faster), distance culling handles scale
- **Cone orientation**: O(n²) → O(n) build + O(1) lookups
- **Node spawning**: Near parent for natural graph expansion

The ref-heavy, hook-centric architecture remains the main technical debt for future feature development.
