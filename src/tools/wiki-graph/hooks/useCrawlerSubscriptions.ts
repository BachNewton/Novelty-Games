import { useEffect } from 'react';
import { WikiCrawler } from '../logic/WikiCrawler';
import { WikiArticle } from '../data/Article';
import { GraphController } from '../logic/GraphController';

interface CrawlerSubscriptionDeps {
    crawler: WikiCrawler;
    controller: GraphController | null;
    selectedArticleRef: { current: string | null };
    setFetchingCount: (count: number) => void;
    setPendingQueueSize: (size: number) => void;
    updateStatsLabel: (title: string) => void;
    onError: (error: Error) => void;
    startArticle: string;
}

export function useCrawlerSubscriptions(deps: CrawlerSubscriptionDeps): void {
    const {
        crawler, controller, selectedArticleRef,
        setFetchingCount, setPendingQueueSize, updateStatsLabel, onError, startArticle
    } = deps;

    useEffect(() => {
        if (!controller) return;

        crawler.onArticleFetched((article: WikiArticle) => {
            try {
                const fetchedTitles = [article.title, ...(article.aliases ?? [])];
                controller.removeFromLoadingIndicators(fetchedTitles);

                const existing = controller.findNodeByTitleOrAlias(article.title, article.aliases);

                // Skip if already exists (and not a leaf promotion)
                if (existing && (!existing.node.article.leaf || article.leaf)) return;

                if (existing) {
                    controller.promoteLeafToFullNode(existing.node, article, existing.aliasTitle);
                } else {
                    controller.createNewNode(article);
                }
            } catch (err) {
                onError(err instanceof Error ? err : new Error(String(err)));
            }
        });

        crawler.onLinkDiscovered((source: string, target: string) => {
            try {
                if (controller.hasArticle(target)) {
                    controller.createLink(source, target);
                } else {
                    controller.registerPendingLink(target, source);
                }
            } catch (err) {
                onError(err instanceof Error ? err : new Error(String(err)));
            }
        });

        crawler.onRequestStateChange((_count: number, batchSize: number) => {
            setFetchingCount(batchSize);
            setPendingQueueSize(crawler.getPendingQueueSize());
        });

        crawler.onLinksQueued((sourceTitle: string, queuedTitles: string[]) => {
            controller.addQueuedIndicator(sourceTitle, queuedTitles);
        });

        crawler.onFetchFailed((failedTitles: string[]) => {
            controller.removeFromLoadingIndicators(failedTitles);
        });

        crawler.onFetchProgress((title: string, linkCount: number, isComplete: boolean) => {
            controller.setLinkProgress(title, linkCount, isComplete);

            if (selectedArticleRef.current === title) {
                updateStatsLabel(title);
            }

            const hasNode = controller.hasArticle(title);

            if (hasNode && !isComplete && !controller.hasLoadingIndicator(title)) {
                controller.addPaginationIndicator(title);
            } else if (isComplete && controller.hasLoadingIndicator(title)) {
                controller.removePaginationIndicator(title);
            }
        });

        crawler.start(startArticle);

        return () => {
            crawler.stop();
        };
    // startArticle intentionally omitted - it's a constant that never changes
    }, [controller, crawler, selectedArticleRef, setFetchingCount, setPendingQueueSize, updateStatsLabel, onError]);
}
