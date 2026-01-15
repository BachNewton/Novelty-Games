import { WikiArticle } from '../data/Article';
import { API_CONFIG } from '../config/apiConfig';
import { WikiFetcher } from './networking/WikiFetcher';
import { createRealWikiFetcher } from './networking/RealWikiFetcher';

const BATCH_SIZE = API_CONFIG.wikipedia.batchSize;

export interface WikiCrawler {
    start: (startTitle: string) => void;
    stop: () => void;
    resume: () => void;
    expand: (title: string) => void;
    promoteLeaf: (title: string) => void;
    setLinkLimit: (limit: number) => void;
    getLinkLimit: () => number;
    setMaxDepth: (depth: number) => void;
    getMaxDepth: () => number;
    isRunning: () => boolean;
    getArticleCount: () => number;
    getLinkCount: () => number;
    getActiveRequests: () => number;
    getPendingQueueSize: () => number;
    onArticleFetched: (callback: (article: WikiArticle) => void) => void;
    onLinkDiscovered: (callback: (source: string, target: string) => void) => void;
    onRequestStateChange: (callback: (activeCount: number, batchSize: number) => void) => void;
    onLinksQueued: (callback: (sourceTitle: string, queuedTitles: string[]) => void) => void;
    onFetchFailed: (callback: (failedTitles: string[]) => void) => void;
    onFetchProgress: (callback: (title: string, linkCount: number, isComplete: boolean) => void) => void;
}


interface QueueItem {
    title: string;
    depth: number;
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export const DEFAULT_LINK_LIMIT = API_CONFIG.crawling.linkLimit.default;
export const DEFAULT_MAX_DEPTH = API_CONFIG.crawling.maxDepth.default;

export function createWikiCrawler(fetcher?: WikiFetcher): WikiCrawler {
    const wikiFetcher = fetcher ?? createRealWikiFetcher();
    // Article state tracking:
    // - articles: Already fetched articles (title -> article)
    // - inFlight: Currently being fetched (prevents duplicate requests, handles React StrictMode double-mount)
    // - pendingQueue: Waiting to be fetched
    const articles = new Map<string, WikiArticle>();
    const inFlight = new Set<string>();
    let pendingQueue: QueueItem[] = [];

    // Link tracking (prevents duplicate link reports)
    const links = new Set<string>();

    // Crawler state
    let running = false;
    let activeRequests = 0;
    let currentBatchSize = 0;

    // Configuration
    let linkLimit = DEFAULT_LINK_LIMIT;
    let maxDepth = DEFAULT_MAX_DEPTH;

    // Event callbacks
    const articleCallbacks: Array<(article: WikiArticle) => void> = [];
    const linkCallbacks: Array<(source: string, target: string) => void> = [];
    const requestCallbacks: Array<(activeCount: number, batchSize: number) => void> = [];
    const linksQueuedCallbacks: Array<(sourceTitle: string, queuedTitles: string[]) => void> = [];
    const fetchFailedCallbacks: Array<(failedTitles: string[]) => void> = [];
    const fetchProgressCallbacks: Array<(title: string, linkCount: number, isComplete: boolean) => void> = [];

    function isAlreadyTracked(title: string): boolean {
        return articles.has(title) || inFlight.has(title);
    }

    function isInPendingQueue(title: string): boolean {
        return pendingQueue.some(q => q.title === title);
    }

    function shouldQueueArticle(title: string): boolean {
        return !isAlreadyTracked(title) && !isInPendingQueue(title);
    }

    function storeArticle(article: WikiArticle): void {
        if (articles.has(article.title)) {
            return;
        }

        articles.set(article.title, article);
        for (const alias of article.aliases ?? []) {
            articles.set(alias, article);
        }
        articleCallbacks.forEach(cb => cb(article));
    }

    function buildBatch(): QueueItem[] {
        const batch: QueueItem[] = [];
        const seenInBatch = new Set<string>();

        while (batch.length < BATCH_SIZE && pendingQueue.length > 0) {
            const item = pendingQueue.shift()!;
            const alreadyFetched = articles.has(item.title);
            const duplicateInBatch = seenInBatch.has(item.title);
            const exceedsCurrentMaxDepth = item.depth > maxDepth;

            if (!alreadyFetched && !duplicateInBatch && !exceedsCurrentMaxDepth) {
                batch.push(item);
                seenInBatch.add(item.title);
            }
        }

        return batch;
    }

    function trackFetchedTitles(
        fetched: WikiArticle[],
        redirects: Map<string, string>
    ): Set<string> {
        const fetchedTitles = new Set<string>();
        for (const article of fetched) {
            fetchedTitles.add(article.title);
        }
        for (const [from] of redirects) {
            fetchedTitles.add(from);
        }
        return fetchedTitles;
    }

    function processLinkDiscovery(article: WikiArticle, linkTitle: string): void {
        const linkKey = `${article.title}|${linkTitle}`;
        if (!links.has(linkKey)) {
            links.add(linkKey);
            linkCallbacks.forEach(cb => cb(article.title, linkTitle));
        }
    }

    function createLeafArticle(linkTitle: string, depth: number): void {
        if (articles.has(linkTitle)) return;

        const leafArticle: WikiArticle = {
            title: linkTitle,
            categories: [],
            links: [],
            depth,
            leaf: true
        };
        articles.set(linkTitle, leafArticle);
        articleCallbacks.forEach(cb => cb(leafArticle));
    }

    function queueChildLinks(article: WikiArticle, selectedLinks: string[]): void {
        const queuedLinks: string[] = [];
        for (const linkTitle of selectedLinks) {
            processLinkDiscovery(article, linkTitle);

            if (shouldQueueArticle(linkTitle)) {
                pendingQueue.push({ title: linkTitle, depth: article.depth + 1 });
                queuedLinks.push(linkTitle);
            }
        }
        if (queuedLinks.length > 0) {
            linksQueuedCallbacks.forEach(cb => cb(article.title, queuedLinks));
        }
    }

    function createLeafLinks(article: WikiArticle, selectedLinks: string[], childDepth: number): void {
        for (const linkTitle of selectedLinks) {
            processLinkDiscovery(article, linkTitle);
            createLeafArticle(linkTitle, childDepth);
        }
    }

    function processArticleLinks(article: WikiArticle): void {
        const selectedLinks = shuffleArray(article.links).slice(0, linkLimit);
        const childDepth = article.depth + 1;
        const shouldQueueChildren = childDepth < maxDepth;

        if (shouldQueueChildren) {
            queueChildLinks(article, selectedLinks);
        } else {
            createLeafLinks(article, selectedLinks, childDepth);
        }
    }

    function createMissingArticles(batch: QueueItem[], fetchedTitles: Set<string>): void {
        const missingItems = batch.filter(item => !fetchedTitles.has(item.title));
        if (missingItems.length === 0) return;

        for (const item of missingItems) {
            const placeholderArticle: WikiArticle = {
                title: item.title,
                categories: [],
                links: [],
                depth: item.depth,
                missing: true
            };
            articles.set(item.title, placeholderArticle);
            articleCallbacks.forEach(cb => cb(placeholderArticle));
        }

        const missingTitles = missingItems.map(item => item.title);
        console.warn(`Missing Wikipedia articles: [${missingTitles.join(', ')}]`);
        fetchFailedCallbacks.forEach(cb => cb(missingTitles));
    }

    async function processQueue(): Promise<void> {
        while (running) {
            const batch = buildBatch();

            if (batch.length === 0) {
                await new Promise(resolve => setTimeout(resolve, API_CONFIG.queuePollIntervalMs));
                continue;
            }

            try {
                const titles = batch.map(item => item.title);
                const depthMap = new Map(batch.map(item => [item.title, item.depth]));

                // Mark as in-flight before fetching
                titles.forEach(title => inFlight.add(title));

                // Track active requests
                activeRequests++;
                currentBatchSize = titles.length;
                const currentActive = activeRequests;
                const currentSize = currentBatchSize;
                requestCallbacks.forEach(cb => cb(currentActive, currentSize));

                try {
                    // Use injected fetcher to fetch articles
                    const { articles: fetched, redirects } = await wikiFetcher.fetchArticles(
                        titles,
                        depthMap,
                        {
                            // Emit articles early so nodes appear during pagination
                            onArticle: (article) => {
                                storeArticle(article);
                            },
                            // Report progress during pagination
                            onProgress: (title, linkCount, isComplete) => {
                                fetchProgressCallbacks.forEach(cb => cb(title, linkCount, isComplete));
                            }
                        }
                    );

                    // Store any remaining articles (e.g., if callbacks weren't used)
                    fetched.forEach(storeArticle);

                    // Track which titles were successfully fetched
                    const fetchedTitles = trackFetchedTitles(fetched, redirects);

                    // Process links for each fetched article
                    fetched.forEach(processArticleLinks);

                    // Handle missing articles
                    createMissingArticles(batch, fetchedTitles);

                } catch (error) {
                    const failedTitles = batch.map(item => item.title);
                    console.error(`Failed to fetch batch [${failedTitles.join(', ')}]:`, error);
                    fetchFailedCallbacks.forEach(cb => cb(failedTitles));
                } finally {
                    // Remove from in-flight after fetching
                    titles.forEach(title => inFlight.delete(title));

                    // Update active requests
                    activeRequests--;
                    currentBatchSize = 0;
                    const finalActive = activeRequests;
                    const finalSize = currentBatchSize;
                    requestCallbacks.forEach(cb => cb(finalActive, finalSize));
                }
            } catch (error) {
                // Outer catch for unexpected errors in batch processing
                console.error(`Unexpected error processing batch:`, error);
            }
        }
    }

    return {
        start: (startTitle) => {
            // Prevent duplicate fetches (handles React StrictMode double-mount)
            if (isAlreadyTracked(startTitle)) {
                if (!running) {
                    running = true;
                    processQueue();
                }
                return;
            }

            // Start fresh BFS from this article at depth 0
            pendingQueue = [{ title: startTitle, depth: 0 }];
            running = true;
            processQueue();
        },

        stop: () => {
            running = false;
        },

        resume: () => {
            if (!running) {
                running = true;
                processQueue();
            }
        },

        expand: (title) => {
            const article = articles.get(title);
            if (!article || article.leaf) return;  // Can't expand a leaf

            // Find unfetched links from this article
            const unfetchedLinks = article.links.filter(linkTitle => {
                return !isAlreadyTracked(linkTitle);
            });

            const selectedLinks = shuffleArray(unfetchedLinks).slice(0, linkLimit);
            const queuedLinks: string[] = [];

            // Check if children should be fetched or created as leafs
            const childDepth = 1;  // expand() always starts fresh BFS at depth 1
            const shouldFetchChildren = childDepth < maxDepth;

            for (const linkTitle of selectedLinks) {
                const linkKey = `${article.title}|${linkTitle}`;
                if (!links.has(linkKey)) {
                    links.add(linkKey);
                    linkCallbacks.forEach(cb => cb(article.title, linkTitle));
                }

                if (shouldFetchChildren) {
                    // Queue at depth 1: clicking any node starts a fresh BFS from that point
                    if (shouldQueueArticle(linkTitle)) {
                        pendingQueue.push({ title: linkTitle, depth: 1 });
                        queuedLinks.push(linkTitle);
                    }
                } else {
                    // Create leaf directly without API call
                    if (!articles.has(linkTitle)) {
                        const leafArticle: WikiArticle = {
                            title: linkTitle,
                            categories: [],
                            links: [],
                            depth: childDepth,
                            leaf: true
                        };
                        articles.set(linkTitle, leafArticle);
                        articleCallbacks.forEach(cb => cb(leafArticle));
                    }
                }
            }

            if (queuedLinks.length > 0) {
                linksQueuedCallbacks.forEach(cb => cb(article.title, queuedLinks));
            }

            // Trigger request state change to update UI
            requestCallbacks.forEach(cb => cb(activeRequests, currentBatchSize));

            // Ensure crawler is running to process the queue
            if (!running && pendingQueue.length > 0) {
                running = true;
                processQueue();
            }
        },

        promoteLeaf: (title) => {
            const article = articles.get(title);
            if (!article || !article.leaf) return;  // Not a leaf

            // Remove from articles so it can be re-fetched
            articles.delete(title);

            // Mark as in-flight to prevent duplicate fetches
            inFlight.add(title);

            // Trigger request state change to update UI
            activeRequests++;
            requestCallbacks.forEach(cb => cb(activeRequests, currentBatchSize));

            // Fetch immediately in parallel (don't wait for queue)
            const depthMap = new Map([[title, 0]]);
            wikiFetcher.fetchArticles(
                [title],
                depthMap,
                {
                    onArticle: (fetchedArticle) => {
                        storeArticle(fetchedArticle);
                    },
                    onProgress: (progressTitle, linkCount, isComplete) => {
                        fetchProgressCallbacks.forEach(cb => cb(progressTitle, linkCount, isComplete));
                    }
                }
            ).then(({ articles: fetched, redirects }) => {
                // Store any remaining articles
                fetched.forEach(storeArticle);

                // Track fetched titles
                const fetchedTitles = new Set<string>();
                for (const a of fetched) fetchedTitles.add(a.title);
                for (const [from] of redirects) fetchedTitles.add(from);

                // Process links for the promoted article
                fetched.forEach(processArticleLinks);

                // Handle if article was missing
                if (!fetchedTitles.has(title)) {
                    createMissingArticles([{ title, depth: 0 }], fetchedTitles);
                }
            }).catch((error) => {
                console.error(`Failed to fetch promoted leaf [${title}]:`, error);
                fetchFailedCallbacks.forEach(cb => cb([title]));
            }).finally(() => {
                inFlight.delete(title);
                activeRequests--;
                requestCallbacks.forEach(cb => cb(activeRequests, currentBatchSize));
            });
        },

        setLinkLimit: (limit: number) => {
            linkLimit = limit;
        },
        getLinkLimit: () => linkLimit,
        setMaxDepth: (depth: number) => {
            maxDepth = depth;
        },
        getMaxDepth: () => maxDepth,
        isRunning: () => running,
        getArticleCount: () => articles.size,
        getLinkCount: () => links.size,
        getActiveRequests: () => activeRequests,
        getPendingQueueSize: () => pendingQueue.length,

        onArticleFetched: (callback) => {
            articleCallbacks.push(callback);
        },

        onLinkDiscovered: (callback) => {
            linkCallbacks.push(callback);
        },

        onRequestStateChange: (callback) => {
            requestCallbacks.push(callback);
        },

        onLinksQueued: (callback) => {
            linksQueuedCallbacks.push(callback);
        },

        onFetchFailed: (callback) => {
            fetchFailedCallbacks.push(callback);
        },

        onFetchProgress: (callback) => {
            fetchProgressCallbacks.push(callback);
        }
    };
}
