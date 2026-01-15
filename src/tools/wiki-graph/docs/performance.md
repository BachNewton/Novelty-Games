# Wiki-Graph Performance

Performance optimizations and benchmarks.

## Summary

| Optimization | Before | After | Improvement |
|--------------|--------|-------|-------------|
| Labels (CSS2D → Troika) | 9 FPS | 28 FPS | 3x faster |
| Cone orientation (O(n²) → O(n)) | O(n²) | O(n) | Linear |
| Physics (naive → Barnes-Hut) | 35 FPS | 95 FPS | 2.7x faster |

All benchmarks at 1000 nodes.

## Labels: CSS2D to Troika Migration

**Problem**: CSS2DRenderer created a DOM element per label. At 1000 nodes, this caused severe layout thrashing—dropping to 9 FPS with only 15% CPU/GPU usage (browser blocked on DOM operations).

**Solution**: Replaced with troika-three-text (SDF-based GPU text rendering).

**Results at 1000 nodes (physics disabled):**

| Label System | FPS | Cost vs baseline |
|--------------|-----|------------------|
| None | 60 | - |
| CSS2D | 9 | -51 FPS |
| Troika | 28 | -32 FPS |

Troika is 3x faster than CSS2D. The remaining 32 FPS cost comes from per-frame updates (position, quaternion for billboarding, opacity for distance fade).

### Distance Culling

Labels beyond `MAX_LABEL_DISTANCE` (~52 units) are set to `visible = false`, skipping the draw call:

```typescript
if (distance < MAX_LABEL_DISTANCE) {
    label.visible = true;
    // ... update position, quaternion, opacity
} else {
    label.visible = false;  // No draw call
}
```

### Benchmark Artifact Warning

Initial testing showed 27 FPS at 1000 nodes with physics disabled. This was a **benchmark artifact**—all nodes were clustered in a small area due to `initialSpawnRange: 20`.

When nodes spawn spread out (as they do in real usage), FPS jumped to 100. The fix was ensuring new nodes spawn near their parent, so the graph expands naturally and distant labels are culled.

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

Each Troika Text is a separate mesh—text content varies per label, preventing traditional instancing.

## Cone Orientation: O(n²) to O(n)

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

## Physics: O(n²) to O(n log n) via Barnes-Hut

**Problem**: `applyRepulsionForces()` compared every node pair. At 1000 nodes: ~500,000 comparisons per frame, dropping to 35 FPS with only 10% CPU / 20% GPU utilization (algorithmic bottleneck, not compute).

**Solution**: Implemented Barnes-Hut algorithm with octree spatial partitioning.

```typescript
// Before: O(n²) - compare every pair
for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
        // calculate repulsion between nodes[i] and nodes[j]
    }
}

// After: O(n log n) - octree approximation
octree.build(nodes);  // O(n log n)
for (const node of nodes) {
    const force = octree.calculateForce(node.position, node.id, theta, strength);
    // Barnes-Hut: if cell_size/distance < theta, treat cluster as single mass
}
```

**Key design decisions:**
- Dynamic bounds: octree computes bounding box from actual node positions each frame
- Theta parameter (default 0.7): controls accuracy vs speed tradeoff, exposed in UI
- No object pooling (kept simple—GC not a bottleneck in practice)

**Results:**

| Nodes | Before | After |
|-------|--------|-------|
| 1000 | 35 FPS | 95 FPS |
| 2000 | ~15 FPS | 77 FPS |

## Future: If More Simultaneous Labels Needed

If requirements change and we need 1000+ visible labels at once:

1. **@pmndrs/uikit** - "Everything is instanced, every glyph" - single draw call
2. **Custom instanced characters** - SDF texture atlas + instanced planes per character (~60 draw calls for A-Z, a-z, 0-9)
3. **LOD approach** - Full labels nearby, colored dots for distant nodes

For current use cases, the existing distance culling is sufficient.
