# CRA to Vite Migration

This document summarizes the migration from Create React App (CRA) to Vite completed in January 2026.

## Why Migrate?

**CRA Status:** Create React App is essentially abandoned. The last significant update was April 2022, and Facebook/Meta no longer actively maintains it.

**Vite Benefits:**
- Faster dev server startup (uses native ES modules instead of bundling)
- Faster Hot Module Replacement (HMR)
- Active development and community support
- Modern tooling that aligns with current web standards

## Pros and Cons

### Pros
- **Speed:** Dev server starts in ~1 second vs CRA's 10+ seconds
- **Future-proof:** Active maintenance and regular updates
- **Better error messages:** More helpful during development
- **Native ES modules:** No bundling during development
- **Flexible configuration:** Easy to customize when needed

### Cons
- **More visible configuration:** CRA hid everything behind `react-scripts`; Vite requires explicit config files
- **PWA setup:** Required `vite-plugin-pwa` with more verbose configuration
- **Asset handling:** Some assets (like FBX files) needed explicit configuration
- **Test adjustments:** Minor changes needed for Vitest compatibility

## What Changed

### Files Added
| File | Purpose |
|------|---------|
| `vite.config.ts` | Main Vite configuration, PWA plugin setup |
| `tsconfig.node.json` | TypeScript config for Vite config file |
| `vitest.config.ts` | Test runner configuration |
| `src/vite-env.d.ts` | Vite type declarations |
| `index.html` (root) | Entry HTML file (moved from public/) |

### Files Modified
| File | Changes |
|------|---------|
| `package.json` | New dependencies, updated scripts |
| `tsconfig.json` | Updated for Vite compatibility |
| `src/service-worker.ts` | `process.env.PUBLIC_URL` → hardcoded base path |
| `src/serviceWorkerRegistration.ts` | `process.env` → `import.meta.env` |
| `src/setupTests.ts` | Added Vitest cleanup |

### Files Deleted
- `src/react-app-env.d.ts` (CRA-specific types)
- `public/index.html` (moved to root)

### Dependencies Changed
**Removed:**
- `react-scripts`
- `@babel/plugin-proposal-private-property-in-object`
- `@types/jest`

**Added:**
- `vite`
- `@vitejs/plugin-react`
- `vite-plugin-pwa`
- `vitest`
- `jsdom`

### Environment Variables
CRA's `process.env` pattern was replaced with Vite's `import.meta.env`:

| CRA | Vite |
|-----|------|
| `process.env.NODE_ENV === 'production'` | `import.meta.env.PROD` |
| `process.env.PUBLIC_URL` | `import.meta.env.BASE_URL` |

### Scripts
| Command | Old (CRA) | New (Vite) |
|---------|-----------|------------|
| Dev server | `react-scripts start` | `vite` |
| Build | `react-scripts build` | `vite build` |
| Test | `react-scripts test` | `vitest` |
| Preview build | N/A | `vite preview` |

## Future Benefits

### Easier Upgrades
Vite releases regular updates. Upgrading is typically just:
```bash
npm update vite @vitejs/plugin-react
```

### Plugin Ecosystem
Vite has a rich plugin ecosystem for future needs:
- Image optimization
- SVG components
- Legacy browser support
- And many more

### Better Debugging
- Faster feedback loop during development
- Source maps work more reliably
- Browser DevTools show actual source files

### SSR Ready
If you ever need server-side rendering, Vite supports it natively.

## Configuration Reference

### Base Path
The `base` option in `vite.config.ts` handles GitHub Pages deployment:
```typescript
base: command === 'build' ? '/Novelty-Games/' : '/',
```
- Development: serves from `/` (localhost:3000)
- Production: serves from `/Novelty-Games/` (GitHub Pages)

### Asset Handling
Binary assets like 3D models are configured in `assetsInclude`:
```typescript
assetsInclude: ['**/*.fbx', '**/*.gltf', '**/*.glb']
```

### PWA Configuration
The service worker uses `injectManifest` strategy to preserve the custom service worker code:
```typescript
VitePWA({
  strategies: 'injectManifest',
  srcDir: 'src',
  filename: 'service-worker.ts',
  // ...
})
```

## Unchanged Systems

The following systems work exactly as before:
- **Version-based updates:** `VersionChecker.ts` still fetches remote version from GitHub
- **Manual versioning:** `npm run patch/minor/major` scripts unchanged
- **PWA functionality:** Service worker, offline support, install prompt
- **GitHub Pages deployment:** `npm run deploy` works the same
