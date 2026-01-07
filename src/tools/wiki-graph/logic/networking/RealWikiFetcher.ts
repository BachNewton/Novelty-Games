import { WikiArticle } from '../../data/Article';
import { WikiFetcher, FetchResult, FetchCallbacks } from './WikiFetcher';
import { API_CONFIG } from '../../config/apiConfig';

const API_BASE = API_CONFIG.wikipedia.baseUrl;
const RATE_LIMIT_MS = API_CONFIG.wikipedia.rateLimitMs;

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

export function createRealWikiFetcher(): WikiFetcher {
    let lastRequestTime = 0;

    async function waitForRateLimit(): Promise<void> {
        const now = Date.now();
        const elapsed = now - lastRequestTime;
        if (elapsed < RATE_LIMIT_MS) {
            await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS - elapsed));
        }
        lastRequestTime = Date.now();
    }

    function parseRedirects(data: WikiApiResponse): Map<string, string> {
        const redirectMap = new Map<string, string>();
        if (data.query?.redirects) {
            for (const redirect of data.query.redirects) {
                redirectMap.set(redirect.from, redirect.to);
            }
        }
        return redirectMap;
    }

    function buildReverseRedirectMap(redirectMap: Map<string, string>): Map<string, string[]> {
        const reverseRedirects = new Map<string, string[]>();
        for (const [from, to] of redirectMap) {
            if (!reverseRedirects.has(to)) {
                reverseRedirects.set(to, []);
            }
            reverseRedirects.get(to)!.push(from);
        }
        return reverseRedirects;
    }

    function normalizeCategory(category: string): string {
        return category.replace(API_CONFIG.markers.categoryPrefix, '');
    }

    function mergePageData(
        existing: WikiArticle,
        page: { links?: Array<{ title: string }>; categories?: Array<{ title: string }> }
    ): void {
        const newLinks = (page.links ?? []).map(l => l.title);
        existing.links.push(...newLinks);
        const newCategories = (page.categories ?? []).map(c => normalizeCategory(c.title));
        existing.categories.push(...newCategories);
    }

    function determineArticleDepth(
        title: string,
        reverseRedirects: Map<string, string[]>,
        depthMap: Map<string, number>
    ): number {
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
        return articleDepth ?? 0;
    }

    function createArticleFromPage(
        page: { title: string; links?: Array<{ title: string }>; categories?: Array<{ title: string }> },
        reverseRedirects: Map<string, string[]>,
        depthMap: Map<string, number>
    ): WikiArticle {
        const title = page.title;
        const articleDepth = determineArticleDepth(title, reverseRedirects, depthMap);
        const redirectSources = reverseRedirects.get(title) ?? [];

        return {
            title,
            categories: (page.categories ?? []).map(c => normalizeCategory(c.title)),
            links: (page.links ?? []).map(l => l.title),
            depth: articleDepth,
            aliases: redirectSources.length > 0 ? redirectSources : undefined
        };
    }

    return {
        fetchArticles: async (
            titles: string[],
            depthMap: Map<string, number>,
            callbacks?: FetchCallbacks
        ): Promise<FetchResult> => {
            const articleMap = new Map<string, WikiArticle>();
            const redirectMap = new Map<string, string>();
            const emittedArticles = new Set<string>();  // Track which articles have been emitted early
            let continueParams: Record<string, string> | undefined;
            let isFirstPage = true;

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

                // Parse redirects on first request
                if (isFirstPage) {
                    const newRedirects = parseRedirects(data);
                    for (const [from, to] of newRedirects) {
                        redirectMap.set(from, to);
                    }
                }

                // Build reverse redirect map for depth lookup
                const reverseRedirects = buildReverseRedirectMap(redirectMap);

                // Process each page in the response
                if (data.query?.pages) {
                    for (const page of Object.values(data.query.pages)) {
                        if ('missing' in page) continue;

                        const existing = articleMap.get(page.title);

                        if (existing) {
                            mergePageData(existing, page);
                        } else {
                            const article = createArticleFromPage(page, reverseRedirects, depthMap);
                            articleMap.set(article.title, article);
                        }
                    }
                }

                // Check for continuation
                continueParams = data.continue ? {
                    continue: data.continue.continue ?? '',
                    ...(data.continue.plcontinue && { plcontinue: data.continue.plcontinue }),
                    ...(data.continue.clcontinue && { clcontinue: data.continue.clcontinue })
                } : undefined;

                // Emit articles early (first time they appear) so nodes can be created
                if (callbacks?.onArticle) {
                    for (const article of articleMap.values()) {
                        if (!emittedArticles.has(article.title)) {
                            callbacks.onArticle(article);
                            emittedArticles.add(article.title);
                        }
                    }
                }

                // Report progress after each page (not complete until no more pages)
                if (callbacks?.onProgress) {
                    for (const article of articleMap.values()) {
                        callbacks.onProgress(article.title, article.links.length, !continueParams);
                    }
                }

                isFirstPage = false;

            } while (continueParams);

            return { articles: Array.from(articleMap.values()), redirects: redirectMap };
        }
    };
}
