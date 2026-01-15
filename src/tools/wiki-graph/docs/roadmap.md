# Wiki-Graph Roadmap

Future improvements and known issues.

## Completed (January 2026)

| Item | Description |
|------|-------------|
| ✅ Extract GraphController | Moved graph state from React refs/hooks into dedicated controller |
| ✅ CSS2D → Troika labels | 3x performance improvement for text rendering |
| ✅ O(n²) → O(n) cone orientation | Pre-built lookup map instead of `find()` per frame |
| ✅ O(n²) → O(n log n) physics | Barnes-Hut octree for repulsion forces |
| ✅ Config file extraction | 9 config files organized by feature |
| ✅ Remove unused files | Deleted LinkFactory.ts, NodeFactory.ts, labelUtils.ts |

## Known Issues

| Issue | Description |
|-------|-------------|
| 🐛 Loading indicator stuck | Progress indicator ring sometimes doesn't resolve |
| 🐛 Node selection behavior | Selecting a node doesn't expand if it's not already selected |
| 🐛 Stats label stale | Stats label is outdated when selecting a new node |

## Technical Debt

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| 1 | Remove duplicate position/velocity from ArticleNode | Low | High |
| 2 | Add null checks for Map assertions | Low | Medium |
| 3 | Consistent terminology (node/leaf/link/label) | Low | Medium |

### Details

**Duplicate position state**: `ArticleNode` stores `position`/`velocity`, but `ForceSimulation` maintains its own copy. Remove from ArticleNode, access via `simulation.getPosition(title)`.

**Non-null assertions**: Code like `meshes.get(type)!` assumes maps are populated. Add early returns or document safety.

**Terminology**: Standardize vocabulary across codebase: node (any article), leaf (unexpanded), link (connection), label (text).

## Feature Ideas

### Controls & Navigation
- WASD movement controls
- Camera follows node as it moves
- Left-click prefers links within graph, right-click prefers links outside

### Visual Improvements
- Better colors and use of categories
- Fog tweaks: exponential vs exponential squared decay, density adjustments
- Bidirectional links: grey or different color instead of red
- New force simulation or graph layout algorithm

### Networking
- Improved networking stats on side panel
- Enhanced networking logic and error handling
