import * as fs from 'fs';

/**
 * Load crawl state from file, or create new state if none exists.
 */
export function loadState(stateFile, graphFile, rootTitle, maxDepth) {
    let articles = {};
    let state = {
        root: rootTitle,
        maxDepth,
        currentDepth: 0,
        queue: [rootTitle],
        nextQueue: []
    };

    // Load existing graph if present
    if (fs.existsSync(graphFile)) {
        articles = JSON.parse(fs.readFileSync(graphFile, 'utf-8'));
        console.log(`Loaded ${Object.keys(articles).length} articles from graph`);
    }

    // Load existing state if present
    if (fs.existsSync(stateFile)) {
        const savedState = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
        state = { ...state, ...savedState };
        console.log(`Resuming from depth ${state.currentDepth}, queue size: ${state.queue.length}\n`);
    }

    return { ...state, articles };
}

/**
 * Save crawl state and graph to separate files (no formatting for smaller size).
 */
export function saveState(stateFile, graphFile, state) {
    const { articles, ...crawlState } = state;

    fs.writeFileSync(stateFile, JSON.stringify(crawlState));
    fs.writeFileSync(graphFile, JSON.stringify(articles));
}
