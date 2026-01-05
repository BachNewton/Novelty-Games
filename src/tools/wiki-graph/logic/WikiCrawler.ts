import { WikiArticle } from '../data/Article';

const API_BASE = 'https://en.wikipedia.org/w/api.php';
const RATE_LIMIT_MS = 1000;
const BATCH_SIZE = 20;

export interface WikiCrawler {
    start: (startTitle: string) => void;
    stop: () => void;
    resume: () => void;
    expand: (title: string) => void;
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

export function createWikiCrawler(): WikiCrawler {
    const articles = new Map<string, WikiArticle>();
    const links = new Set<string>();
    const inFlight = new Set<string>(); // Articles currently being fetched
    let pendingQueue: QueueItem[] = [];
    let running = false;
    let activeRequests = 0;
    let lastRequestTime = 0;
    let linkLimit = 4;
    let maxDepth = 1;

    const articleCallbacks: Array<(article: WikiArticle) => void> = [];
    const linkCallbacks: Array<(source: string, target: string) => void> = [];
    const requestCallbacks: Array<(activeCount: number, batchSize: number) => void> = [];
    const linksQueuedCallbacks: Array<(sourceTitle: string, queuedTitles: string[]) => void> = [];
    const fetchFailedCallbacks: Array<(failedTitles: string[]) => void> = [];
    const fetchProgressCallbacks: Array<(title: string, linkCount: number, isComplete: boolean) => void> = [];
    let currentBatchSize = 0;

    function normalizeTitle(title: string): string {
        return title.replace(/_/g, ' ');
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
                        redirectMap.set(normalizeTitle(redirect.from), normalizeTitle(redirect.to));
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

                        const title = normalizeTitle(page.title);
                        const existing = articleMap.get(title);

                        if (existing) {
                            // Merge links from continuation
                            const newLinks = (page.links ?? []).map(l => normalizeTitle(l.title));
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
                                links: (page.links ?? []).map(l => normalizeTitle(l.title)),
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
            // Build a batch of items to fetch from the queue
            const batch: QueueItem[] = [];
            const seen = new Set<string>();

            while (batch.length < BATCH_SIZE && pendingQueue.length > 0) {
                const item = pendingQueue.shift()!;
                const normalized = normalizeTitle(item.title);
                if (!articles.has(normalized) && !seen.has(normalized)) {
                    batch.push(item);
                    seen.add(normalized);
                }
            }

            if (batch.length === 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
                continue;
            }

            try {
                const titles = batch.map(item => item.title);
                const depthMap = new Map(batch.map(item => [normalizeTitle(item.title), item.depth]));

                // Mark as in-flight before fetching
                for (const title of titles) {
                    inFlight.add(normalizeTitle(title));
                }

                const { articles: fetched, redirects } = await fetchArticles(titles, depthMap);

                // Remove from in-flight after fetching
                for (const title of titles) {
                    inFlight.delete(normalizeTitle(title));
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

                // Now that pagination is complete, queue links for each article
                for (const article of fetched) {
                    // Randomly select limited links
                    const selectedLinks = shuffleArray(article.links).slice(0, linkLimit);

                    // Only add links to queue if we haven't reached max depth
                    if (article.depth < maxDepth) {
                        const queuedLinks: string[] = [];
                        for (const linkTitle of selectedLinks) {
                            const linkKey = `${article.title}|${linkTitle}`;
                            if (!links.has(linkKey)) {
                                links.add(linkKey);
                                linkCallbacks.forEach(cb => cb(article.title, linkTitle));

                                const normalizedLink = normalizeTitle(linkTitle);
                                const inPending = pendingQueue.some(q => normalizeTitle(q.title) === normalizedLink);

                                if (!articles.has(normalizedLink) && !inPending) {
                                    pendingQueue.push({ title: linkTitle, depth: article.depth + 1 });
                                    queuedLinks.push(normalizedLink);
                                }
                            }
                        }
                        if (queuedLinks.length > 0) {
                            linksQueuedCallbacks.forEach(cb => cb(article.title, queuedLinks));
                        }
                    } else {
                        // Still report links for visualization, but don't queue them
                        for (const linkTitle of selectedLinks) {
                            const linkKey = `${article.title}|${linkTitle}`;
                            if (!links.has(linkKey)) {
                                links.add(linkKey);
                                linkCallbacks.forEach(cb => cb(article.title, linkTitle));
                            }
                        }
                    }
                }

                // Report any missing articles (requested but not returned by API)
                const missingTitles = batch
                    .map(item => normalizeTitle(item.title))
                    .filter(title => !fetchedTitles.has(title));
                if (missingTitles.length > 0) {
                    console.warn(`Missing Wikipedia articles: [${missingTitles.join(', ')}]`);
                    fetchFailedCallbacks.forEach(cb => cb(missingTitles));
                }
            } catch (error) {
                const failedTitles = batch.map(item => normalizeTitle(item.title));
                console.error(`Failed to fetch batch [${failedTitles.join(', ')}]:`, error);
                fetchFailedCallbacks.forEach(cb => cb(failedTitles));
            }
        }
    }

    return {
        start: (startTitle) => {
            const normalized = normalizeTitle(startTitle);

            // If already fetched or currently being fetched, just resume if stopped
            if (articles.has(normalized) || inFlight.has(normalized)) {
                if (!running) {
                    running = true;
                    processQueue();
                }
                return;
            }

            pendingQueue = [{ title: normalized, depth: 0 }];
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
            const article = articles.get(normalizeTitle(title));
            if (article) {
                // Find links whose targets haven't been fetched yet
                const unfetchedLinks = article.links.filter(linkTitle => {
                    const normalizedLink = normalizeTitle(linkTitle);
                    return !articles.has(normalizedLink);
                });

                // Randomly select limited links from unfetched ones
                const selectedLinks = shuffleArray(unfetchedLinks).slice(0, linkLimit);

                const queuedLinks: string[] = [];
                for (const linkTitle of selectedLinks) {
                    const normalizedLink = normalizeTitle(linkTitle);
                    const inPending = pendingQueue.some(q => normalizeTitle(q.title) === normalizedLink);

                    // Report the link (creates line when target is fetched)
                    const linkKey = `${article.title}|${linkTitle}`;
                    if (!links.has(linkKey)) {
                        links.add(linkKey);
                        linkCallbacks.forEach(cb => cb(article.title, linkTitle));
                    }

                    if (!inPending) {
                        pendingQueue.push({ title: linkTitle, depth: article.depth + 1 });
                        queuedLinks.push(normalizedLink);
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
