# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run build      # Production build
npm test           # Run tests in watch mode
```

No separate lint command - uses Create React App's built-in linting. ESLint config disables `react-hooks/exhaustive-deps`.

## Project Overview

A React PWA serving as a multi-game hub with 16+ games. Hosted on GitHub Pages at `https://bachnewton.github.io/Novelty-Games/`.

**Tech Stack:** React 18 + TypeScript, Three.js (3D games), Socket.io (multiplayer), cannon-es (physics), Workbox (PWA/service worker)

## Architecture

### Custom Routing
Uses a custom routing system (no React Router). See `src/ui/Routing.ts` for route definitions and navigation logic via `window.history.pushState()`.

### State Management
Class-based state objects (HomeState, Game2DState, etc.) rather than Redux/Zustand. Each state class manages its feature's state.

### Game Organization Pattern
Each game follows this structure:
```
game-name/
├── ui/     # React components
├── logic/  # Game rules & state
└── data/   # Data models
```

### Key Directories
- `src/game-3D/` - Three.js games (Marble, Knight, Fortuna, Toddler Treasure Hunt)
- `src/game-2D/` - Canvas games (Platformer, RPG, Cat Game)
- `src/board-games/` - Multiplayer games (Mille-Bornes, Labyrinth, Monopoly, Poker)
- `src/mobile-games/` - Mobile-optimized games (Free Market, Pets)
- `src/tools/` - Utilities (Music Player, Fortnite Festival tracker)
- `src/trivia/` - Trivia games with question data
- `src/util/` - Shared utilities including Storage.ts (localStorage wrapper)
- `models/` - 3D model assets
- `scrapers/` - Web scrapers (Fortnite Festival, Jeopardy, Airplanes)

### Key Files
- `src/Versioning.ts` - App version constant (update via npm scripts, not manually)
- `src/service-worker.ts` - PWA offline/caching logic
- `src/util/Storage.ts` - localStorage abstraction layer

## Coding Philosophy

### Evolution Over Rigid Consistency
Consistency matters, but this codebase evolves. If an existing pattern is inefficient, confusing, or outdated, propose something better rather than perpetuating it. New projects can introduce improved systems to set an example—older projects using legacy patterns can be refactored later. Don't let "that's how it's done elsewhere" justify a suboptimal approach.

### Preferred Patterns

**React Components:** Use `React.FC`. Only define a Props interface if the component actually has props:
```tsx
// With props
interface NameProps { someProp: string; }

const Name: React.FC<NameProps> = ({ someProp }) => {
    return <div>{someProp}</div>;
};

// Without props
const Name: React.FC = () => {
    return <div></div>;
};

export default Name;
```

**Objects over Classes:** Prefer interfaces + factory functions instead of classes. Use function scope to manage public/private visibility. Since the interface defines parameter types, omit redundant type annotations in the factory function:
```ts
export interface Thing {
    getValue: () => number;
    increment: () => void;
}

export function createThing(): Thing {
    // Private state and functions live here (closure scope)
    let count = 0;

    return {
        getValue: () => count,
        increment: () => { count++; }
    };
}
```

**Prefer `const`:** Use `const` by default; only use `let` when reassignment is necessary.

## Deployment

- Build output: `build/`
- Deploy target: GitHub Pages (`gh-pages` branch)
- CI: GitHub Actions runs weekly Fortnite Festival data scraper
