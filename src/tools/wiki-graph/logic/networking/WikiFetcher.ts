import { WikiArticle } from '../../data/Article';

export interface FetchResult {
    articles: WikiArticle[];
    redirects: Map<string, string>;
}

export type ProgressCallback = (title: string, linkCount: number, isComplete: boolean) => void;
export type ArticleCallback = (article: WikiArticle) => void;

export interface FetchCallbacks {
    onProgress?: ProgressCallback;
    onArticle?: ArticleCallback;  // Fires early when article first available (may have partial links)
}

export interface WikiFetcher {
    fetchArticles: (
        titles: string[],
        depthMap: Map<string, number>,
        callbacks?: FetchCallbacks
    ) => Promise<FetchResult>;
}
