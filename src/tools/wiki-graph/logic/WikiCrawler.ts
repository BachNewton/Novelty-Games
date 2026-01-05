import { WikiArticle } from '../data/Article';

const API_BASE = 'https://en.wikipedia.org/w/api.php';
const RATE_LIMIT_MS = 1000;
const BATCH_SIZE = 20;

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

interface WikiApiResponse {
    query?: {
        redirects?: Array<{ from: string; to: string }>;
        pages?: Record<string, {
            title: string;
            categories?: Array<{ title: string }>;
            links?: Array<{ title: string }>;
        }>;
    };
    continue?: {
        continue?: string;
        plcontinue?: string;
        clcontinue?: string;
    };
}

interface FetchResult {
    articles: WikiArticle[];
    redirects: Map<string, string>;  // from → to
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

export const DEFAULT_LINK_LIMIT = 4;
export const DEFAULT_MAX_DEPTH = 1;

export function createWikiCrawler(): WikiCrawler {
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
    let lastRequestTime = 0;
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

    async function waitForRateLimit(): Promise<void> {
        const now = Date.now();
        const elapsed = now - lastRequestTime;
        if (elapsed < RATE_LIMIT_MS) {
            await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS - elapsed));
        }
        lastRequestTime = Date.now();
    }

    async function fetchArticles(titles: string[], depthMap: Map<string, number>): Promise<FetchResult> {
        const articleMap = new Map<string, WikiArticle>();
        const redirectMap = new Map<string, string>();
        const emittedArticles = new Set<string>();
        let continueParams: Record<string, string> | undefined;
        let isFirstPage = true;

        activeRequests++;
        currentBatchSize = titles.length;
        requestCallbacks.forEach(cb => cb(activeRequests, currentBatchSize));

        try {
            // Keep fetching until all data is retrieved (handle pagination)
            do {
                await waitForRateLimit();

                const params = new URLSearchParams({
                    action: 'query',
                    titles: titles.join('|'),
                    prop: 'links|categories',
                    pllimit: 'max',
                    plnamespace: '0',
                    clshow: '!hidden',
                    cllimit: 'max',
                    redirects: '1',
                    format: 'json',
                    origin: '*',
                    ...continueParams
                });

                const response = await fetch(`${API_BASE}?${params}`);
                const data: WikiApiResponse = await response.json();

                // Parse redirects (only on first request)
                if (isFirstPage && data.query?.redirects) {
                    for (const redirect of data.query.redirects) {
                        redirectMap.set(redirect.from, redirect.to);
                    }
                }

                // Build reverse redirect map for depth lookup
                const reverseRedirects = new Map<string, string[]>();
                for (const [from, to] of redirectMap) {
                    if (!reverseRedirects.has(to)) {
                        reverseRedirects.set(to, []);
                    }
                    reverseRedirects.get(to)!.push(from);
                }

                if (data.query?.pages) {
                    for (const page of Object.values(data.query.pages)) {
                        if ('missing' in page) continue;

                        const title = page.title;
                        const existing = articleMap.get(title);

                        if (existing) {
                            // Merge links from continuation
                            const newLinks = (page.links ?? []).map(l => l.title);
                            existing.links.push(...newLinks);
                            // Merge categories
                            const newCategories = (page.categories ?? []).map(c => c.title.replace('Category:', ''));
                            existing.categories.push(...newCategories);
                        } else {
                            // Determine depth from canonical title or redirect sources
                            let articleDepth = depthMap.get(title);
                            if (articleDepth === undefined) {
                                const redirectSources = reverseRedirects.get(title) ?? [];
                                for (const source of redirectSources) {
                                    const sourceDepth = depthMap.get(source);
                                    if (sourceDepth !== undefined) {
                                        articleDepth = sourceDepth;
                                        break;
                                    }
                                }
                            }
                            articleDepth = articleDepth ?? 0;

                            const redirectSources = reverseRedirects.get(title) ?? [];

                            const article: WikiArticle = {
                                title,
                                categories: (page.categories ?? []).map(c => c.title.replace('Category:', '')),
                                links: (page.links ?? []).map(l => l.title),
                                depth: articleDepth,
                                aliases: redirectSources.length > 0 ? redirectSources : undefined
                            };
                            articleMap.set(title, article);

                            // Emit article immediately so node appears
                            if (!articles.has(title) && !emittedArticles.has(title)) {
                                articles.set(title, article);
                                for (const source of redirectSources) {
                                    articles.set(source, article);
                                }
                                emittedArticles.add(title);
                                articleCallbacks.forEach(cb => cb(article));
                            }
                        }
                    }
                }

                // Check for continuation
                continueParams = data.continue ? {
                    continue: data.continue.continue ?? '',
                    ...(data.continue.plcontinue && { plcontinue: data.continue.plcontinue }),
                    ...(data.continue.clcontinue && { clcontinue: data.continue.clcontinue })
                } : undefined;

                // Report progress for each article after each pagination request
                const hasMoreLinks = !!data.continue?.plcontinue;
                for (const article of articleMap.values()) {
                    fetchProgressCallbacks.forEach(cb => cb(article.title, article.links.length, !hasMoreLinks));
                }

                isFirstPage = false;

            } while (continueParams);

            return { articles: Array.from(articleMap.values()), redirects: redirectMap };
        } finally {
            activeRequests--;
            currentBatchSize = 0;
            requestCallbacks.forEach(cb => cb(activeRequests, currentBatchSize));
        }
    }

    async function processQueue(): Promise<void> {
        while (running) {
            // Build a batch of items to fetch (skip already-fetched articles)
            const batch: QueueItem[] = [];
            const seenInBatch = new Set<string>();

            while (batch.length < BATCH_SIZE && pendingQueue.length > 0) {
                const item = pendingQueue.shift()!;
                const alreadyFetched = articles.has(item.title);
                const duplicateInBatch = seenInBatch.has(item.title);

                if (!alreadyFetched && !duplicateInBatch) {
                    batch.push(item);
                    seenInBatch.add(item.title);
                }
            }

            if (batch.length === 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
                continue;
            }

            try {
                const titles = batch.map(item => item.title);
                const depthMap = new Map(batch.map(item => [item.title, item.depth]));

                // Mark as in-flight before fetching
                for (const title of titles) {
                    inFlight.add(title);
                }

                const { articles: fetched, redirects } = await fetchArticles(titles, depthMap);

                // Remove from in-flight after fetching
                for (const title of titles) {
                    inFlight.delete(title);
                }

                // Track which requested titles were successfully fetched
                const fetchedTitles = new Set<string>();
                for (const article of fetched) {
                    fetchedTitles.add(article.title);
                }
                // Also count redirects as fetched (the source title resolved to a canonical title)
                for (const [from] of redirects) {
                    fetchedTitles.add(from);
                }

                // Queue child links for BFS continuation
                for (const article of fetched) {
                    const selectedLinks = shuffleArray(article.links).slice(0, linkLimit);

                    // BFS depth check: only queue children if they would be below maxDepth
                    const childDepth = article.depth + 1;
                    const shouldQueueChildren = childDepth < maxDepth;

                    if (shouldQueueChildren) {
                        const queuedLinks: string[] = [];
                        for (const linkTitle of selectedLinks) {
                            const linkKey = `${article.title}|${linkTitle}`;
                            if (!links.has(linkKey)) {
                                links.add(linkKey);
                                linkCallbacks.forEach(cb => cb(article.title, linkTitle));

                                if (shouldQueueArticle(linkTitle)) {
                                    pendingQueue.push({ title: linkTitle, depth: article.depth + 1 });
                                    queuedLinks.push(linkTitle);
                                }
                            }
                        }
                        if (queuedLinks.length > 0) {
                            linksQueuedCallbacks.forEach(cb => cb(article.title, queuedLinks));
                        }
                    } else {
                        // At max depth: create leaf nodes (no API call, just placeholders)
                        for (const linkTitle of selectedLinks) {
                            const linkKey = `${article.title}|${linkTitle}`;
                            if (!links.has(linkKey)) {
                                links.add(linkKey);
                                linkCallbacks.forEach(cb => cb(article.title, linkTitle));

                                // Create leaf if not already tracked
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
                    }
                }

                // Create placeholder nodes for missing articles (requested but not returned by API)
                const missingItems = batch.filter(item => !fetchedTitles.has(item.title));
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
                if (missingItems.length > 0) {
                    const missingTitles = missingItems.map(item => item.title);
                    console.warn(`Missing Wikipedia articles: [${missingTitles.join(', ')}]`);
                    fetchFailedCallbacks.forEach(cb => cb(missingTitles));
                }
            } catch (error) {
                const failedTitles = batch.map(item => item.title);
                console.error(`Failed to fetch batch [${failedTitles.join(', ')}]:`, error);
                fetchFailedCallbacks.forEach(cb => cb(failedTitles));
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

            for (const linkTitle of selectedLinks) {
                const linkKey = `${article.title}|${linkTitle}`;
                if (!links.has(linkKey)) {
                    links.add(linkKey);
                    linkCallbacks.forEach(cb => cb(article.title, linkTitle));
                }

                // Queue at depth 1: clicking any node starts a fresh BFS from that point
                if (shouldQueueArticle(linkTitle)) {
                    pendingQueue.push({ title: linkTitle, depth: 1 });
                    queuedLinks.push(linkTitle);
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

            // Queue for fetching at depth 0 (fresh BFS from this point)
            pendingQueue.push({ title, depth: 0 });

            // Trigger request state change to update UI
            requestCallbacks.forEach(cb => cb(activeRequests, currentBatchSize));

            // Ensure crawler is running to process the queue
            if (!running) {
                running = true;
                processQueue();
            }
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
