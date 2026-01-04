import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load .env from script directory
dotenv.config({ path: path.join(import.meta.dirname, '.env') });
import { loadState, saveState } from './state.js';
import { bfs } from './bfs.js';
import { login } from './api.js';

const ROOT_TITLE = 'Finland';
const DEFAULT_DEPTH = 2;

// File paths
const STATE_FILE = path.join(import.meta.dirname, 'crawlState.json');
const GRAPH_FILE = path.join(import.meta.dirname, '../../db/wikiGraph.json');

// Parse command line args
const args = process.argv.slice(2);
const isNew = args.includes('--new');

function parseDepth() {
    const depthIndex = args.indexOf('--depth');
    if (depthIndex !== -1 && args[depthIndex + 1]) {
        const depth = parseInt(args[depthIndex + 1], 10);
        if (!isNaN(depth) && depth > 0) return depth;
    }
    return DEFAULT_DEPTH;
}

const maxDepth = parseDepth();

(async () => {
    console.log(`Wikipedia BFS Graph Crawler`);
    console.log(`Root: ${ROOT_TITLE} | Max Depth: ${maxDepth}\n`);

    // Login required for bot rate limits
    try {
        await login();
    } catch (e) {
        console.error('Login failed:', e.message);
        process.exit(1);
    }

    // Delete existing files if --new flag
    if (isNew) {
        if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE);
        if (fs.existsSync(GRAPH_FILE)) fs.unlinkSync(GRAPH_FILE);
        console.log('Starting fresh crawl\n');
    }

    const state = loadState(STATE_FILE, GRAPH_FILE, ROOT_TITLE, maxDepth);
    state.maxDepth = maxDepth;

    await bfs(state, STATE_FILE, GRAPH_FILE);

    console.log(`\nDone! ${Object.keys(state.articles).length} articles saved to ${GRAPH_FILE}`);
})();
