# Wiki-Graph Architecture Review

Post-cleanup code review with recommendations for future improvements.

## Cleanup Completed (January 2026)

| Goal | What Was Done |
|------|---------------|
| Remove unused code/files | Deleted `LinkFactory.ts`, `NodeFactory.ts`, removed `CrawlState` interface |
| Extract magic numbers to config | Created 9 config files organized by feature (nodeConfig, linkConfig, sceneConfig, etc.) |
| Reduce code duplication | Created `labelUtils.ts` to consolidate label creation |
| Reduce excessive nesting | Extracted `promoteLeafToFullNode()` and `createNewArticleNode()` from 92-line callback |
| Review/update comments | Verified all comments accurate; found and fixed `CONFIG` -> `NODE_CONFIG` bug |

**Files deleted**: 2 (LinkFactory.ts, NodeFactory.ts)
**Files created**: 10 (9 config files + labelUtils.ts)
**Files modified**: 13
**Net lines reduced**: ~100-150

## Current Strengths

1. **Factory Function Pattern** - Consistently applied per CLAUDE.md guidelines
2. **Clear Directory Structure** - config/, data/, hooks/, logic/, scene/, ui/, util/
3. **Good TypeScript Usage** - Proper interfaces, no `any` types, union types for variants
4. **Instanced Mesh Implementation** - Correct batching and GPU updates

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

`Home.tsx:82-89` creates 7 refs passed through hooks as mutable global state:

```typescript
const articlesRef = useRef<Map<string, ArticleNode>>(new Map());
const linksRef = useRef<ArticleLink[]>([]);
const pendingLinksRef = useRef<Map<string, Set<string>>>(new Map());
const loadingIndicatorsRef = useRef<Map<string, LoadingIndicator>>(new Map());
const linkCountsRef = useRef<Map<string, LinkCount>>(new Map());
const selectedArticleRef = useRef<string | null>(START_ARTICLE);
const statsLabelRef = useRef<CSS2DObject | null>(null);
```

**Impact**: Hard to trace data flow, prevents React re-renders, implicit dependencies, untestable.

**Fix**: Create a dedicated `GraphState` container managed outside React (context + reducer, or Zustand).

#### Solution Options

**React Context** (built-in): Share state without prop drilling. Downside: all consumers re-render when any part of state changes unless you split contexts or memoize carefully.

**Zustand** (recommended): Lightweight state library (~1KB). Creates a store outside React that components subscribe to selectively.

```typescript
// src/tools/wiki-graph/state/graphStore.ts
import { create } from 'zustand';
import { ArticleNode, ArticleLink } from '../data/Article';
import { LoadingIndicator } from '../scene/LoadingIndicatorFactory';

interface LinkCount {
    count: number;
    isComplete: boolean;
}

interface GraphState {
    articles: Map<string, ArticleNode>;
    links: ArticleLink[];
    pendingLinks: Map<string, Set<string>>;
    loadingIndicators: Map<string, LoadingIndicator>;
    linkCounts: Map<string, LinkCount>;
    selectedArticle: string | null;
}

export const useGraphStore = create<GraphState>(() => ({
    articles: new Map(),
    links: [],
    pendingLinks: new Map(),
    loadingIndicators: new Map(),
    linkCounts: new Map(),
    selectedArticle: null
}));
```

Usage:
```typescript
// In hooks/controller (non-reactive)
const articles = useGraphStore.getState().articles;

// In React components (reactive, selective)
const selectedArticle = useGraphStore(state => state.selectedArticle);
```

#### Complexity Comparison

| | Current (refs) | With Zustand |
|--|----------------|--------------|
| Dependencies | 0 | +1 small lib (~1KB) |
| Lines of code | ~same | ~same |
| Works now | Yes | Yes |
| Testable | No | Yes |
| Type-safe | With `!` hacks | Fully |
| Learning curve | None | ~30 min |

The current ref approach works. This refactor is about future maintainability, not fixing something broken.

### 3. Business Logic in Hooks

`useCrawlerSubscriptions` (332 lines) handles:
- 6 event subscriptions
- Loading indicators
- Node/link creation
- Leaf promotion
- Simulation sync
- UI state updates

**Impact**: Untestable, hard to reason about, React lifecycle tangled with business logic.

**Fix**: Extract a plain TypeScript `GraphController` that:
- Owns all graph mutation logic
- Has no React dependencies
- Emits events or updates state that React subscribes to

```typescript
// Example structure
export interface GraphController {
    handleArticleFetched: (article: WikiArticle) => void;
    handleLinkDiscovered: (source: string, target: string) => void;
    dispose: () => void;
}

export function createGraphController(
    simulation: ForceSimulation,
    nodeManager: InstancedNodeManager,
    // ...other dependencies
): GraphController {
    // All business logic here
}
```

The hook becomes just wiring:
```typescript
useEffect(() => {
    const controller = createGraphController(...);
    crawler.onArticleFetched(controller.handleArticleFetched);
    return () => controller.dispose();
}, []);
```

### 4. Non-Null Assertions

Patterns throughout the codebase assume refs/maps are always populated:

```typescript
const articles = articlesRef.current!;  // useCrawlerSubscriptions.ts:104
const data = meshes.get(type)!;         // InstancedLinkManager.ts:118
nodes.get(nodeIds[i])!;                 // ForceSimulation.ts:88
```

**Impact**: Silent runtime failures if assumptions break.

**Fix**: Use early returns with null checks, or document why assertion is safe.

**Note**: This issue is largely solved by fixing #2 (Ref-Heavy Architecture). The non-null assertions exist because `RefObject<T>.current` is typed as `T | null`. A `GraphState` container with concrete types eliminates most of these—you'd have one ref holding the container instead of seven nullable refs.

### 5. O(n^2) Physics

`ForceSimulation.applyRepulsionForces` compares every node pair. With `nodeLimit: 500`, that's 124,750 comparisons per frame. There's already a TODO acknowledging this (`ForceSimulation.ts:162-164`):

```typescript
// TODO: O(n²) repulsion is too expensive for large graphs.
// Consider: Barnes-Hut algorithm (O(n log n)), spatial partitioning,
// or Web Workers for parallel computation.
```

**Impact**: CPU bottleneck before visual density limits.

**Fix**: Implement Barnes-Hut algorithm (octree-based O(n log n)) or use d3-force-3d.

### 6. DOM Labels Don't Scale

`CSS2DRenderer` creates a DOM element per label. 500+ absolutely-positioned elements restyled every frame will strain the browser.

**Impact**: Layout thrashing at scale.

**Fix**: Consider SDF text (troika-three-text), sprite-based labels, or more aggressive culling.

### 7. `as const` Type Friction

Config files use `as const` for immutability, but this causes literal type inference:
```typescript
export const DEFAULT_LINK_LIMIT = API_CONFIG.defaults.linkLimit; // type is `4`, not `number`
```

**Impact**: Type errors when assigning to mutable variables.

**Fix**: Add explicit types at export: `export const DEFAULT_LINK_LIMIT: number = ...`

## Is This Idiomatic TypeScript?

**Mostly yes.** The code follows TypeScript conventions:
- Interface-first design
- Proper generic usage
- No `any` escape hatches
- Good use of union types

**But** the React patterns are non-idiomatic. Heavy ref usage, massive hooks, and mutable Maps/Sets passed around aren't how modern React applications are typically structured. The TypeScript is good; the React architecture needs work.

## When These Issues Matter

These architectural issues become blockers when you want to:
- **Support 1000+ nodes** - O(n^2) physics and DOM labels will struggle
- **Add features like filtering, search, undo/redo** - Ref-heavy architecture makes state management painful
- **Write tests** - Business logic buried in hooks is nearly impossible to unit test
- **Onboard other contributors** - Data flow through closures and refs is hard to trace

For the current scope (interactive Wikipedia graph exploration), the code works fine. These are investments for future growth.

## Priority Recommendations

| Priority | Change | Effort | Impact |
|----------|--------|--------|--------|
| 1 | Extract `GraphController` from hooks | Medium | High |
| 2 | Remove duplicate position/velocity from `ArticleNode` | Low | High |
| 3 | Create centralized `GraphState` type | Low | Medium |
| 4 | Replace O(n^2) physics with Barnes-Hut | High | Medium |
| 5 | Fix `as const` type widening at exports | Low | Low |

## Summary

The codebase is functional and maintainable at current scope. The cleanup (config organization, dead code removal, function extraction) established a solid foundation.

However, the ref-heavy, hook-centric architecture has scaling limits. Before adding features like filtering, search, undo/redo, or supporting 1000+ nodes, the business logic should be extracted from React into testable, standalone modules.
