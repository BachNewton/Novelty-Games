import { WikiArticle } from '../data/Article';

const API_BASE = 'https://en.wikipedia.org/w/api.php';
const RATE_LIMIT_MS = 1000;
const BATCH_SIZE = 20;
const MAX_DEPTH = 1;

export interface WikiCrawler {
    start: (startTitle: string) => void;
    stop: () => void;
    resume: () => void;
    prioritize: (title: string) => void;
    setLinkLimit: (limit: number) => void;
    getLinkLimit: () => number;
    isRunning: () => boolean;
    getArticleCount: () => number;
    getLinkCount: () => number;
    getActiveRequests: () => number;
    getPriorityQueueSize: () => number;
    getPendingQueueSize: () => number;
    onArticleFetched: (callback: (article: WikiArticle) => void) => void;
    onLinkDiscovered: (callback: (source: string, target: string) => void) => void;
    onRequestStateChange: (callback: (activeCount: number) => void) => void;
}

interface WikiApiResponse {
    query?: {
        redirects?: Array<{ from: string; to: string }>;
        pages?: Record<string, {
            title: string;
            description?: string;
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
    let pendingQueue: QueueItem[] = [];
    let priorityQueue: QueueItem[] = [];
    let running = false;
    let activeRequests = 0;
    let lastRequestTime = 0;
    let linkLimit = 4;

    const articleCallbacks: Array<(article: WikiArticle) => void> = [];
    const linkCallbacks: Array<(source: string, target: string) => void> = [];
    const requestCallbacks: Array<(count: number) => void> = [];

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

    async function fetchArticles(titles: string[]): Promise<FetchResult> {
        const articleMap = new Map<string, WikiArticle>();
        const redirectMap = new Map<string, string>();
        let continueParams: Record<string, string> | undefined;

        activeRequests++;
        requestCallbacks.forEach(cb => cb(activeRequests));

        try {
            // Keep fetching until all data is retrieved (handle pagination)
            do {
                await waitForRateLimit();

                const params = new URLSearchParams({
                    action: 'query',
                    titles: titles.join('|'),
                    prop: 'links|description|categories',
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
                if (!continueParams && data.query?.redirects) {
                    for (const redirect of data.query.redirects) {
                        redirectMap.set(normalizeTitle(redirect.from), normalizeTitle(redirect.to));
                    }
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
                            articleMap.set(title, {
                                title,
                                description: page.description ?? '',
                                categories: (page.categories ?? []).map(c => c.title.replace('Category:', '')),
                                links: (page.links ?? []).map(l => normalizeTitle(l.title)),
                                depth: 0
                            });
                        }
                    }
                }

                // Check for continuation
                continueParams = data.continue ? {
                    continue: data.continue.continue ?? '',
                    ...(data.continue.plcontinue && { plcontinue: data.continue.plcontinue }),
                    ...(data.continue.clcontinue && { clcontinue: data.continue.clcontinue })
                } : undefined;

            } while (continueParams);

            return { articles: Array.from(articleMap.values()), redirects: redirectMap };
        } finally {
            activeRequests--;
            requestCallbacks.forEach(cb => cb(activeRequests));
        }
    }

    async function processQueue(): Promise<void> {
        while (running) {
            // Build a batch of items to fetch, prioritizing from priority queue
            const batch: QueueItem[] = [];
            const seen = new Set<string>();

            // First, take from priority queue
            while (batch.length < BATCH_SIZE && priorityQueue.length > 0) {
                const item = priorityQueue.shift()!;
                const normalized = normalizeTitle(item.title);
                if (!articles.has(normalized) && !seen.has(normalized)) {
                    batch.push(item);
                    seen.add(normalized);
                }
            }

            // Then fill remaining slots from pending queue
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
                const { articles: fetched, redirects } = await fetchArticles(titles);

                // Build reverse redirect map: canonical → [original titles]
                const reverseRedirects = new Map<string, string[]>();
                for (const [from, to] of redirects) {
                    if (!reverseRedirects.has(to)) {
                        reverseRedirects.set(to, []);
                    }
                    reverseRedirects.get(to)!.push(from);
                }

                for (const article of fetched) {
                    if (articles.has(article.title)) continue;

                    // Check depth from canonical title or any redirect source
                    let articleDepth = depthMap.get(article.title);
                    if (articleDepth === undefined) {
                        const redirectSources = reverseRedirects.get(article.title) ?? [];
                        for (const source of redirectSources) {
                            const sourceDepth = depthMap.get(source);
                            if (sourceDepth !== undefined) {
                                articleDepth = sourceDepth;
                                break;
                            }
                        }
                    }
                    articleDepth = articleDepth ?? 0;
                    article.depth = articleDepth;

                    // Include redirect aliases in the article
                    const redirectSources = reverseRedirects.get(article.title) ?? [];
                    article.aliases = redirectSources.length > 0 ? redirectSources : undefined;

                    articles.set(article.title, article);

                    // Also store under redirect source titles so crawler can find it
                    for (const source of redirectSources) {
                        articles.set(source, article);
                        console.log(`REDIRECT: ${source} → ${article.title}`);
                    }

                    articleCallbacks.forEach(cb => cb(article));
                    console.log(`FETCHED: ${article.title} (depth ${articleDepth}, ${article.links.length} total links)`);

                    // Randomly select limited links
                    const selectedLinks = shuffleArray(article.links).slice(0, linkLimit);

                    // Only add links to queue if we haven't reached max depth
                    if (articleDepth < MAX_DEPTH) {
                        for (const linkTitle of selectedLinks) {
                            const linkKey = `${article.title}|${linkTitle}`;
                            if (!links.has(linkKey)) {
                                links.add(linkKey);
                                linkCallbacks.forEach(cb => cb(article.title, linkTitle));
                                console.log(`${article.title} --> ${linkTitle} (depth ${articleDepth})`);

                                const normalizedLink = normalizeTitle(linkTitle);
                                const inPending = pendingQueue.some(q => normalizeTitle(q.title) === normalizedLink);
                                const inPriority = priorityQueue.some(q => normalizeTitle(q.title) === normalizedLink);

                                if (!articles.has(normalizedLink) && !inPending && !inPriority) {
                                    pendingQueue.push({ title: linkTitle, depth: articleDepth + 1 });
                                }
                            }
                        }
                    } else {
                        // Still report links for visualization, but don't queue them
                        for (const linkTitle of selectedLinks) {
                            const linkKey = `${article.title}|${linkTitle}`;
                            if (!links.has(linkKey)) {
                                links.add(linkKey);
                                linkCallbacks.forEach(cb => cb(article.title, linkTitle));
                                console.log(`${article.title} --> ${linkTitle} (depth ${articleDepth}, not queued)`);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`Failed to fetch batch:`, error);
            }
        }
    }

    return {
        start: (startTitle) => {
            const normalized = normalizeTitle(startTitle);
            pendingQueue = [{ title: normalized, depth: 0 }];
            priorityQueue = [];
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

        prioritize: (title) => {
            const article = articles.get(normalizeTitle(title));
            if (article) {
                // Reset this node as the new root (depth 0)
                article.depth = 0;

                // Find links whose targets haven't been fetched yet
                const unfetchedLinks = article.links.filter(linkTitle => {
                    const normalizedLink = normalizeTitle(linkTitle);
                    return !articles.has(normalizedLink);
                });

                // Randomly select limited links from unfetched ones
                const selectedLinks = shuffleArray(unfetchedLinks).slice(0, linkLimit);

                console.log(`Prioritizing ${title}: ${unfetchedLinks.length} unfetched, selecting ${selectedLinks.length}`);

                for (const linkTitle of selectedLinks) {
                    const normalizedLink = normalizeTitle(linkTitle);
                    const inPriority = priorityQueue.some(q => normalizeTitle(q.title) === normalizedLink);
                    const inPending = pendingQueue.some(q => normalizeTitle(q.title) === normalizedLink);

                    // Report the link (creates line when target is fetched)
                    const linkKey = `${article.title}|${linkTitle}`;
                    if (!links.has(linkKey)) {
                        links.add(linkKey);
                        linkCallbacks.forEach(cb => cb(article.title, linkTitle));
                        console.log(`${article.title} --> ${linkTitle} (link reported)`);
                    }

                    if (!inPriority && !inPending) {
                        // Queue unfetched articles
                        priorityQueue.push({ title: linkTitle, depth: 1 });
                        console.log(`${linkTitle} (queued for fetch)`);
                    } else {
                        console.log(`${linkTitle} (already in queue)`);
                    }
                }

                // Trigger request state change to update UI
                requestCallbacks.forEach(cb => cb(activeRequests));

                // Ensure crawler is running to process the queue
                if (!running && priorityQueue.length > 0) {
                    running = true;
                    processQueue();
                }
            }
        },

        setLinkLimit: (limit: number) => {
            linkLimit = limit;
        },
        getLinkLimit: () => linkLimit,
        isRunning: () => running,
        getArticleCount: () => articles.size,
        getLinkCount: () => links.size,
        getActiveRequests: () => activeRequests,
        getPriorityQueueSize: () => priorityQueue.length,
        getPendingQueueSize: () => pendingQueue.length,

        onArticleFetched: (callback) => {
            articleCallbacks.push(callback);
        },

        onLinkDiscovered: (callback) => {
            linkCallbacks.push(callback);
        },

        onRequestStateChange: (callback) => {
            requestCallbacks.push(callback);
        }
    };
}
