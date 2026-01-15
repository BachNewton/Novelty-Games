# Wiki-Graph Architecture

Overview of the wiki-graph visualization system architecture.

## Directory Structure

```
wiki-graph/
├── config/       # Configuration constants (9 files)
├── data/         # Data models (Article.ts)
├── docs/         # Documentation
├── hooks/        # React hooks for scene, animation, interaction
├── logic/        # Core business logic
│   ├── GraphController.ts    # Central graph state manager
│   ├── WikiCrawler.ts        # Wikipedia API crawler
│   ├── ForceSimulation.ts    # Physics simulation
│   ├── CategoryTracker.ts    # Category coloring
│   ├── CameraAnimator.ts     # Smooth camera transitions
│   ├── Octree.ts             # Barnes-Hut spatial partitioning
│   └── networking/           # API fetchers (real + mock)
├── scene/        # Three.js scene management
│   ├── SceneManager.ts       # Scene, camera, renderer setup
│   ├── InstancedNodeManager.ts  # Batched node rendering
│   ├── InstancedLinkManager.ts  # Batched link rendering
│   └── LoadingIndicatorFactory.ts
├── ui/           # React components
│   ├── Home.tsx              # Main component
│   └── ProgressPanel.tsx     # Controls sidebar
└── util/         # Utilities (troikaLabelUtils.ts)
```

## Key Patterns

### Factory Functions
Per project guidelines, all logic uses factory functions instead of classes:

```typescript
export interface GraphController {
    getArticles: () => Map<string, ArticleNode>;
    createNewNode: (article: WikiArticle) => void;
    // ...
}

export function createGraphController(deps: GraphControllerDeps): GraphController {
    // Private state in closure
    const articles = new Map<string, ArticleNode>();

    return {
        getArticles: () => articles,
        createNewNode: (article) => { /* ... */ }
    };
}
```

### Instanced Rendering
Nodes and links use Three.js InstancedMesh for GPU-efficient batching:
- 3 node meshes: sphere (full nodes), cone (leaves), box (missing)
- 2 link meshes: directional, bidirectional overlay

### State Ownership

**GraphController** owns all graph state:
- `articles: Map<string, ArticleNode>` - All nodes
- `links: ArticleLink[]` - All connections
- `pendingLinks: Map<string, Set<string>>` - Links awaiting target creation
- `loadingIndicators: Map<string, LoadingIndicator>` - Spinner rings
- `linkCounts: Map<string, LinkCount>` - Pagination progress

**ForceSimulation** owns physics state:
- Node positions and velocities
- Spring/repulsion forces
- Barnes-Hut octree for O(n log n) repulsion

**React (Home.tsx)** owns:
- UI state (counts, selected article, control values)
- Scene lifecycle (via useThreeScene hook)

### Data Flow

```
WikiCrawler events
       ↓
useCrawlerSubscriptions (translates events to controller calls)
       ↓
GraphController (mutates graph state)
       ↓
useAnimationLoop (reads state, updates positions, renders)
```

## Current Strengths

1. **Clear Separation** - GraphController owns state, hooks handle React integration
2. **Good TypeScript** - Proper interfaces, no `any` types, union types for variants
3. **Efficient Rendering** - Instanced meshes (5 draw calls for all geometry)
4. **GPU Labels** - Troika SDF text scales better than DOM elements
5. **Scalable Physics** - Barnes-Hut O(n log n) handles 2000+ nodes

## Remaining Technical Debt

### 1. Duplicated Position State

`ArticleNode` stores `position` and `velocity` (Article.ts:22-23), but `ForceSimulation` maintains its own copy. Every frame copies simulation → node:

```typescript
const pos = simulation.getPosition(title);
if (pos) {
    node.position.copy(pos);
}
```

**Impact**: Memory overhead, potential sync bugs, confusing ownership.

**Fix**: Remove `position`/`velocity` from `ArticleNode`. Access via `simulation.getPosition(title)` everywhere.

### 2. Non-Null Assertions

Some code assumes maps are always populated:

```typescript
const data = meshes.get(type)!;         // InstancedLinkManager.ts
nodes.get(nodeIds[i])!;                 // ForceSimulation.ts
```

**Impact**: Silent runtime failures if assumptions break.

**Fix**: Use early returns with null checks, or document why assertion is safe.
