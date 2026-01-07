import { WikiArticle } from '../../data/Article';
import { WikiFetcher, FetchResult, FetchCallbacks } from './WikiFetcher';
import { API_CONFIG } from '../../config/apiConfig';

const CATEGORY_POOL = [
    'Science', 'History', 'Geography', 'Mathematics', 'Physics',
    'Biology', 'Chemistry', 'Technology', 'Arts', 'Music',
    'Literature', 'Philosophy', 'Politics', 'Economics', 'Sports'
];

const EXISTING_LINK_RATIO = 0.5;
const RED_LINK_RATIO = 0.005;

export interface MockWikiFetcher extends WikiFetcher {
    setDelay: (delayMs: number) => void;
    getDelay: () => number;
}

export function createMockWikiFetcher(): MockWikiFetcher {
    const generatedArticles = new Set<string>();
    const redLinkTitles = new Set<string>();
    let delayMs = API_CONFIG.mock.delay.default;

    function generateLinkCount(): number {
        const skewed = Math.pow(Math.random(), 0.5);
        return Math.floor(skewed * 2245) + 5; // 5-2250
    }

    function generateCategories(): string[] {
        const count = Math.floor(Math.random() * 3) + 1;
        const categories = new Set<string>();
        while (categories.size < count) {
            categories.add(`Category:${CATEGORY_POOL[Math.floor(Math.random() * CATEGORY_POOL.length)]}`);
        }
        return Array.from(categories);
    }

    function generateLinks(articleTitle: string, totalLinks: number): string[] {
        const links: string[] = [];

        // Calculate target counts
        const redLinkCount = Math.floor(totalLinks * RED_LINK_RATIO);
        const targetExistingCount = Math.floor(totalLinks * EXISTING_LINK_RATIO);

        // Can't link to more existing articles than actually exist (no duplicates)
        const availableExisting = Array.from(generatedArticles).filter(a => a !== articleTitle);
        const actualExistingCount = Math.min(targetExistingCount, availableExisting.length);

        // Whatever we couldn't fill with existing becomes new links
        const newCount = totalLinks - actualExistingCount - redLinkCount;

        // Add existing article links (no duplicates - shuffle and take first N)
        const shuffledExisting = [...availableExisting].sort(() => Math.random() - 0.5);
        for (let i = 0; i < actualExistingCount; i++) {
            links.push(shuffledExisting[i]);
        }

        // Add red links
        for (let i = 0; i < redLinkCount; i++) {
            const redLink = `${articleTitle}/RedLink-${i}`;
            links.push(redLink);
            redLinkTitles.add(redLink);
        }

        // Add new article links with path-style names (don't add to generatedArticles)
        for (let i = 0; i < newCount; i++) {
            const newLink = `${articleTitle}/Link-${i}`;
            links.push(newLink);
        }

        // Shuffle to distribute link types
        for (let i = links.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [links[i], links[j]] = [links[j], links[i]];
        }

        return links;
    }

    function createLazyArticle(title: string, depth: number): WikiArticle {
        const targetLinkCount = generateLinkCount();
        let resolvedLinks: string[] | null = null;

        generatedArticles.add(title);

        const article: WikiArticle = {
            title,
            categories: generateCategories(),
            get links(): string[] {
                if (resolvedLinks === null) {
                    resolvedLinks = generateLinks(title, targetLinkCount);
                }
                return resolvedLinks;
            },
            depth,
            aliases: []
        };

        (article as any)._targetLinkCount = targetLinkCount;
        return article;
    }

    return {
        setDelay: (ms: number) => { delayMs = ms; },
        getDelay: () => delayMs,

        fetchArticles: async (
            titles: string[],
            depthMap: Map<string, number>,
            callbacks?: FetchCallbacks
        ): Promise<FetchResult> => {
            const articles: WikiArticle[] = [];
            const LINKS_PER_PAGE = 500;
            const PAGE_DELAY_MS = 50;

            // Handle red links first
            for (const title of titles) {
                if (redLinkTitles.has(title)) {
                    const missing: WikiArticle = {
                        title,
                        categories: [],
                        links: [],
                        depth: depthMap.get(title) ?? 0,
                        missing: true,
                        aliases: []
                    };
                    articles.push(missing);
                    callbacks?.onArticle?.(missing);
                }
            }

            const titlesToFetch = titles.filter(t => !redLinkTitles.has(t));

            // Initial delay
            if (titlesToFetch.length > 0 && delayMs > 0) {
                await new Promise(r => setTimeout(r, delayMs));
            }

            // Create all articles and emit them
            const articleData: Array<{ article: WikiArticle; targetCount: number }> = [];
            for (const title of titlesToFetch) {
                const article = createLazyArticle(title, depthMap.get(title) ?? 0);
                const targetCount = (article as any)._targetLinkCount ?? 0;
                articles.push(article);
                articleData.push({ article, targetCount });
                callbacks?.onArticle?.(article);
            }

            // Simulate pagination - report progress in pages of 500 links
            const reportedCounts = new Map<string, number>();
            let allComplete = false;

            while (!allComplete) {
                allComplete = true;

                for (const { article, targetCount } of articleData) {
                    const reported = reportedCounts.get(article.title) ?? 0;
                    if (reported < targetCount) {
                        const newReported = Math.min(reported + LINKS_PER_PAGE, targetCount);
                        const isComplete = newReported >= targetCount;
                        reportedCounts.set(article.title, newReported);
                        callbacks?.onProgress?.(article.title, newReported, isComplete);

                        if (!isComplete) {
                            allComplete = false;
                        }
                    }
                }

                if (!allComplete && delayMs > 0) {
                    await new Promise(r => setTimeout(r, PAGE_DELAY_MS));
                }
            }

            return { articles, redirects: new Map() };
        }
    };
}
