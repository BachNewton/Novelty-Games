import { useEffect, RefObject } from 'react';
import * as THREE from 'three';
import { WikiCrawler } from '../logic/WikiCrawler';
import { ForceSimulation } from '../logic/ForceSimulation';
import { CategoryTracker } from '../logic/CategoryTracker';
import { SceneManager } from '../scene/SceneManager';
import { NodeFactory, LoadingIndicator } from '../scene/NodeFactory';
import { LinkFactory } from '../scene/LinkFactory';
import { WikiArticle, ArticleNode, ArticleLink } from '../data/Article';

interface LinkCount {
    count: number;
    isComplete: boolean;
}

interface CrawlerSubscriptionDeps {
    crawler: WikiCrawler;
    sceneManager: SceneManager | null;
    simulation: ForceSimulation;
    categoryTracker: CategoryTracker;
    nodeFactory: NodeFactory;
    linkFactory: LinkFactory;
    articlesRef: RefObject<Map<string, ArticleNode>>;
    linksRef: RefObject<ArticleLink[]>;
    pendingLinksRef: RefObject<Map<string, Set<string>>>;
    loadingIndicatorsRef: RefObject<Map<string, LoadingIndicator>>;
    linkCountsRef: RefObject<Map<string, LinkCount>>;
    selectedArticleRef: RefObject<string | null>;
    setArticleCount: (count: number) => void;
    setLinkCount: (count: number) => void;
    setFetchingCount: (count: number) => void;
    setPendingQueueSize: (size: number) => void;
    updateStatsLabel: (title: string) => void;
    startArticle: string;
}

export function useCrawlerSubscriptions(deps: CrawlerSubscriptionDeps): void {
    useEffect(() => {
        const {
            crawler, sceneManager, simulation, categoryTracker, nodeFactory, linkFactory,
            articlesRef, linksRef, pendingLinksRef, loadingIndicatorsRef, linkCountsRef,
            selectedArticleRef, setArticleCount, setLinkCount, setFetchingCount,
            setPendingQueueSize, updateStatsLabel, startArticle
        } = deps;

        const articles = articlesRef.current!;
        const links = linksRef.current!;
        const pendingLinks = pendingLinksRef.current!;
        const loadingIndicators = loadingIndicatorsRef.current!;
        const linkCounts = linkCountsRef.current!;

        if (!sceneManager) return;

        const { scene } = sceneManager.getComponents();

        function removeFromLoadingIndicators(titles: string[]) {
            for (const [sourceTitle, indicator] of loadingIndicators) {
                for (const title of titles) {
                    indicator.pending.delete(title);
                }
                if (indicator.pending.size === 0) {
                    scene.remove(indicator.ring);
                    indicator.ring.geometry.dispose();
                    (indicator.ring.material as THREE.Material).dispose();
                    loadingIndicators.delete(sourceTitle);
                }
            }
        }

        function createLink(source: string, target: string) {
            const existing = links.find(
                l => l.source === source && l.target === target
            );
            if (existing) return;

            const sourceNode = articles.get(source);
            const targetNode = articles.get(target);
            if (!sourceNode || !targetNode) return;

            const reverseLink = links.find(
                l => l.source === target && l.target === source
            );

            const line = linkFactory.createLink(!!reverseLink);
            scene.add(line);

            links.push({ source, target, line });
            simulation.addLink(source, target);

            if (reverseLink) {
                linkFactory.setBidirectional(reverseLink.line);
            }

            setLinkCount(links.length);

            if (selectedArticleRef.current && source === selectedArticleRef.current) {
                updateStatsLabel(selectedArticleRef.current);
            }
        }

        crawler.onArticleFetched((article: WikiArticle) => {
            const fetchedTitles = [article.title, ...(article.aliases ?? [])];
            removeFromLoadingIndicators(fetchedTitles);

            if (articles.has(article.title)) return;

            categoryTracker.registerArticle(article.title, article.categories);
            const color = categoryTracker.getArticleColor(article.title);

            const mesh = nodeFactory.createNode(article, color);
            scene.add(mesh);

            const position = new THREE.Vector3();
            const velocity = new THREE.Vector3();

            const node: ArticleNode = { article, mesh, position, velocity };

            articles.set(article.title, node);
            simulation.addNode(article.title);

            if (article.aliases) {
                for (const alias of article.aliases) {
                    articles.set(alias, node);
                }
            }

            // Resolve pending links
            const titlesToCheck = [article.title, ...(article.aliases ?? [])];
            for (const title of titlesToCheck) {
                const pending = pendingLinks.get(title);
                if (pending) {
                    for (const sourceTitle of pending) {
                        createLink(sourceTitle, article.title);
                    }
                    pendingLinks.delete(title);
                }
            }

            setArticleCount(articles.size);
        });

        crawler.onLinkDiscovered((source: string, target: string) => {
            if (articles.has(target)) {
                createLink(source, target);
            } else {
                if (!pendingLinks.has(target)) {
                    pendingLinks.set(target, new Set());
                }
                pendingLinks.get(target)!.add(source);
            }
        });

        crawler.onRequestStateChange((_count: number, batchSize: number) => {
            setFetchingCount(batchSize);
            setPendingQueueSize(crawler.getPendingQueueSize());
        });

        crawler.onLinksQueued((sourceTitle: string, queuedTitles: string[]) => {
            const existing = loadingIndicators.get(sourceTitle);
            if (existing) {
                for (const title of queuedTitles) {
                    existing.pending.add(title);
                }
            } else {
                const ring = nodeFactory.createLoadingIndicator();
                scene.add(ring);
                loadingIndicators.set(sourceTitle, {
                    ring,
                    pending: new Set(queuedTitles)
                });
            }
        });

        crawler.onFetchFailed((failedTitles: string[]) => {
            removeFromLoadingIndicators(failedTitles);
        });

        crawler.onFetchProgress((title: string, linkCount: number, isComplete: boolean) => {
            linkCounts.set(title, { count: linkCount, isComplete });

            if (selectedArticleRef.current === title) {
                updateStatsLabel(title);
            }

            const node = articles.get(title);

            if (node && !isComplete && !loadingIndicators.has(title)) {
                const ring = nodeFactory.createLoadingIndicator();
                scene.add(ring);
                loadingIndicators.set(title, {
                    ring,
                    pending: new Set(['__pagination__'])
                });
            } else if (isComplete && loadingIndicators.has(title)) {
                const indicator = loadingIndicators.get(title)!;
                indicator.pending.delete('__pagination__');
                if (indicator.pending.size === 0) {
                    scene.remove(indicator.ring);
                    indicator.ring.geometry.dispose();
                    (indicator.ring.material as THREE.Material).dispose();
                    loadingIndicators.delete(title);
                }
            }
        });

        crawler.start(startArticle);

        return () => {
            crawler.stop();
        };
    }, [deps]);
}
