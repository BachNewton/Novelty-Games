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
        pages?: Record<string, {
            title: string;
            description?: string;
            categories?: Array<{ title: string }>;
            links?: Array<{ title: string }>;
        }>;
    };
    continue?: {
        plcontinue?: string;
    };
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
    let linkLimit = 10;

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

    async function fetchArticles(titles: string[]): Promise<WikiArticle[]> {
        await waitForRateLimit();

        const params = new URLSearchParams({
            action: 'query',
            titles: titles.join('|'),
            prop: 'links|description|categories',
            pllimit: 'max',
            plnamespace: '0',
            clshow: '!hidden',
            cllimit: 'max',
            format: 'json',
            origin: '*'
        });

        activeRequests++;
        requestCallbacks.forEach(cb => cb(activeRequests));

        try {
            const response = await fetch(`${API_BASE}?${params}`);
            const data: WikiApiResponse = await response.json();

            const results: WikiArticle[] = [];

            if (data.query?.pages) {
                for (const page of Object.values(data.query.pages)) {
                    if ('missing' in page) continue;

                    const article: WikiArticle = {
                        title: normalizeTitle(page.title),
                        description: page.description ?? '',
                        categories: (page.categories ?? []).map(c => c.title.replace('Category:', '')),
                        links: (page.links ?? []).map(l => normalizeTitle(l.title)),
                        depth: 0  // Will be set correctly in processQueue
                    };

                    results.push(article);
                }
            }

            return results;
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
                const fetched = await fetchArticles(titles);

                for (const article of fetched) {
                    if (articles.has(article.title)) continue;

                    const articleDepth = depthMap.get(article.title) ?? 0;
                    article.depth = articleDepth;

                    articles.set(article.title, article);
                    articleCallbacks.forEach(cb => cb(article));

                    // Randomly select limited links
                    const selectedLinks = shuffleArray(article.links).slice(0, linkLimit);

                    // Only add links to queue if we haven't reached max depth
                    if (articleDepth < MAX_DEPTH) {
                        for (const linkTitle of selectedLinks) {
                            const linkKey = `${article.title}|${linkTitle}`;
                            if (!links.has(linkKey)) {
                                links.add(linkKey);
                                linkCallbacks.forEach(cb => cb(article.title, linkTitle));

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
            if (article && article.depth < MAX_DEPTH) {
                for (const linkTitle of article.links) {
                    const normalizedLink = normalizeTitle(linkTitle);
                    const inPriority = priorityQueue.some(q => normalizeTitle(q.title) === normalizedLink);

                    if (!articles.has(normalizedLink) && !inPriority) {
                        const pendingIndex = pendingQueue.findIndex(q => normalizeTitle(q.title) === normalizedLink);
                        if (pendingIndex !== -1) {
                            pendingQueue.splice(pendingIndex, 1);
                        }
                        priorityQueue.push({ title: linkTitle, depth: article.depth + 1 });
                    }
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
