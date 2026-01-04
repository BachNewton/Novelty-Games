import { processBatchArticles } from './api.js';
import { saveState } from './state.js';
import { createProgressTracker } from './progress.js';

const BATCH_SIZE = 50; // Titles per API request (Wikipedia limit)
const CONCURRENCY = 4;  // Parallel batch requests (4 x 50 = 200 titles in flight)
const SAVE_INTERVAL = 1000;

export async function bfs(state, stateFile, graphFile) {
    const { maxDepth, articles } = state;

    while (state.currentDepth <= maxDepth && state.queue.length > 0) {
        const depth = state.currentDepth;
        const queue = [...state.queue];
        const total = queue.length;
        let processed = 0;
        let saved = 0;

        const progress = createProgressTracker();

        console.log(`\nDepth ${depth}: Processing ${total.toLocaleString()} articles...`);
        progress.start();

        // Process queue in batches
        let batchIndex = 0;
        const batches = [];
        for (let i = 0; i < queue.length; i += BATCH_SIZE) {
            batches.push(queue.slice(i, i + BATCH_SIZE));
        }

        const processBatch = async () => {
            while (batchIndex < batches.length) {
                const currentBatchIndex = batchIndex++;
                const batch = batches[currentBatchIndex];

                const results = await processBatchArticles(batch);

                for (const result of results) {
                    processed++;
                    state.queue = state.queue.filter(t => t !== result.requestedTitle);

                    if (result.error) continue;

                    // Dedupe by resolved title
                    if (articles[result.title]) continue;

                    // Add to articles
                    articles[result.title] = {
                        title: result.title,
                        description: result.description,
                        link: result.link,
                        links: result.links
                    };

                    // Queue links for next depth
                    if (depth < maxDepth) {
                        for (const link of result.links) {
                            const normalized = link.replace(/_/g, ' ');
                            if (!articles[link] && !articles[normalized] && !state.nextQueue.includes(link)) {
                                state.nextQueue.push(link);
                            }
                        }
                    }
                }

                progress.render(processed, total, depth, maxDepth, `Batch ${currentBatchIndex + 1}/${batches.length}`);

                // Save periodically
                if (processed - saved >= SAVE_INTERVAL) {
                    saved = processed;
                    saveState(stateFile, graphFile, state);
                }
            }
        };

        // Start concurrent batch workers
        const workers = Array(Math.min(CONCURRENCY, batches.length))
            .fill(null)
            .map(() => processBatch());

        await Promise.all(workers);

        // Move to next depth
        state.currentDepth++;
        state.queue = state.nextQueue;
        state.nextQueue = [];

        console.log(`\nDepth ${depth} complete. ${Object.keys(articles).length.toLocaleString()} total articles.`);
        saveState(stateFile, graphFile, state);
    }

    return articles;
}
