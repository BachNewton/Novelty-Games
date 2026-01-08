import { useEffect, RefObject } from 'react';
import * as THREE from 'three';
import { WikiCrawler } from '../logic/WikiCrawler';
import { ForceSimulation } from '../logic/ForceSimulation';
import { CategoryTracker } from '../logic/CategoryTracker';
import { SceneManager } from '../scene/SceneManager';
import { LoadingIndicator, createLoadingIndicator } from '../scene/LoadingIndicatorFactory';
import { InstancedNodeManager, NodeType } from '../scene/InstancedNodeManager';
import { InstancedLinkManager } from '../scene/InstancedLinkManager';
import { WikiArticle, ArticleNode, ArticleLink } from '../data/Article';
import { API_CONFIG } from '../config/apiConfig';
import { createTitleLabel } from '../util/troikaLabelUtils';

interface LinkCount {
    count: number;
    isComplete: boolean;
}

interface ExistingNodeResult {
    node: ArticleNode;
    aliasTitle: string | null;
}

function findNodeByTitleOrAlias(
    articles: Map<string, ArticleNode>,
    title: string,
    aliases?: string[]
): ExistingNodeResult | null {
    const direct = articles.get(title);
    if (direct) return { node: direct, aliasTitle: null };

    if (!aliases) return null;

    for (const alias of aliases) {
        const node = articles.get(alias);
        if (node?.article.leaf) {
            return { node, aliasTitle: alias };
        }
    }
    return null;
}

function disposeIndicator(scene: THREE.Scene, indicator: LoadingIndicator) {
    scene.remove(indicator.ring);
    indicator.ring.geometry.dispose();
    (indicator.ring.material as THREE.Material).dispose();
}

function resolvePendingLinks(
    article: WikiArticle,
    pendingLinks: Map<string, Set<string>>,
    createLink: (source: string, target: string) => void
) {
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
}

interface CrawlerSubscriptionDeps {
    crawler: WikiCrawler;
    sceneManager: SceneManager | null;
    simulation: ForceSimulation;
    categoryTracker: CategoryTracker;
    nodeManager: InstancedNodeManager;
    linkManager: InstancedLinkManager;
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
    onError: (error: Error) => void;
    startArticle: string;
}

// Helper to determine node type from article
function getNodeType(article: WikiArticle): NodeType {
    if (article.leaf) return 'cone';
    if (article.missing) return 'box';
    return 'sphere';
}

export function useCrawlerSubscriptions(deps: CrawlerSubscriptionDeps): void {
    useEffect(() => {
        const {
            crawler, sceneManager, simulation, categoryTracker, nodeManager, linkManager,
            articlesRef, linksRef, pendingLinksRef, loadingIndicatorsRef, linkCountsRef,
            selectedArticleRef, setArticleCount, setLinkCount, setFetchingCount,
            setPendingQueueSize, updateStatsLabel, onError, startArticle
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
                    disposeIndicator(scene, indicator);
                    loadingIndicators.delete(sourceTitle);
                }
            }
        }

        function createLink(source: string, target: string) {
            // Check if link already exists
            const existing = links.find(
                l => l.source === source && l.target === target
            );
            if (existing) return;

            const sourceNode = articles.get(source);
            const targetNode = articles.get(target);
            if (!sourceNode || !targetNode) return;

            // Check if reverse link exists (making this bidirectional)
            const reverseLink = links.find(
                l => l.source === target && l.target === source
            );

            // Add as directional link
            const instanceIndex = linkManager.addLink('directional');
            links.push({ source, target, instanceIndex, linkType: 'directional' });

            // If reverse exists, add bidirectional overlay on top
            if (reverseLink) {
                const biIndex = linkManager.addLink('bidirectional');
                // Store bidirectional link (uses same source/target as original for transform updates)
                links.push({ source, target, instanceIndex: biIndex, linkType: 'bidirectional' });
            }

            simulation.addLink(source, target);
            setLinkCount(links.length);

            if (selectedArticleRef.current && source === selectedArticleRef.current) {
                updateStatsLabel(selectedArticleRef.current);
            }
        }

        function promoteLeafToFullNode(
            existingNode: ArticleNode,
            article: WikiArticle,
            aliasTitle: string | null
        ): void {
            // Remove the old label
            scene.remove(existingNode.label);
            existingNode.label.dispose();

            // Hide the old cone instance
            nodeManager.hideInstance(existingNode.instanceType, existingNode.instanceIndex);

            // Create new instance for the promoted node
            categoryTracker.registerArticle(article.title, article.categories);
            const color = categoryTracker.getArticleColor(article.title);
            const nodeType = getNodeType(article);
            const instanceIndex = nodeManager.addNode(nodeType, color);

            const label = createTitleLabel(article.title, false, article.missing === true);
            scene.add(label);

            // Update existing node
            existingNode.article = article;
            existingNode.instanceIndex = instanceIndex;
            existingNode.instanceType = nodeType;
            existingNode.label = label;

            // Handle title changes (redirect case) - preserve position
            if (aliasTitle && aliasTitle !== article.title) {
                const currentPosition = simulation.getPosition(aliasTitle);
                articles.delete(aliasTitle);
                simulation.removeNode(aliasTitle);
                simulation.addNode(article.title, currentPosition);
            } else {
                simulation.addNode(article.title);
            }

            // Store under canonical title and aliases
            articles.set(article.title, existingNode);
            for (const alias of article.aliases ?? []) {
                articles.set(alias, existingNode);
            }

            resolvePendingLinks(article, pendingLinks, createLink);
        }

        function createNewArticleNode(article: WikiArticle): void {
            const nodeType = getNodeType(article);
            let color = 0xffffff; // Default white for leaves/missing

            if (!article.leaf && !article.missing) {
                categoryTracker.registerArticle(article.title, article.categories);
                color = categoryTracker.getArticleColor(article.title);
            }

            const instanceIndex = nodeManager.addNode(nodeType, color);
            const label = createTitleLabel(article.title, article.leaf === true, article.missing === true);
            scene.add(label);

            const node: ArticleNode = {
                article,
                instanceIndex,
                instanceType: nodeType,
                label,
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3()
            };

            articles.set(article.title, node);
            simulation.addNode(article.title);
            for (const alias of article.aliases ?? []) {
                articles.set(alias, node);
            }

            resolvePendingLinks(article, pendingLinks, createLink);
            setArticleCount(articles.size);
        }

        crawler.onArticleFetched((article: WikiArticle) => {
            try {
                const fetchedTitles = [article.title, ...(article.aliases ?? [])];
                removeFromLoadingIndicators(fetchedTitles);

                const existing = findNodeByTitleOrAlias(articles, article.title, article.aliases);

                // Skip if already exists (and not a leaf promotion)
                if (existing && (!existing.node.article.leaf || article.leaf)) return;

                if (existing) {
                    promoteLeafToFullNode(existing.node, article, existing.aliasTitle);
                } else {
                    createNewArticleNode(article);
                }
            } catch (err) {
                onError(err instanceof Error ? err : new Error(String(err)));
            }
        });

        crawler.onLinkDiscovered((source: string, target: string) => {
            try {
                if (articles.has(target)) {
                    createLink(source, target);
                } else {
                    if (!pendingLinks.has(target)) {
                        pendingLinks.set(target, new Set());
                    }
                    pendingLinks.get(target)!.add(source);
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
            const existing = loadingIndicators.get(sourceTitle);
            if (existing) {
                for (const title of queuedTitles) {
                    existing.pending.add(title);
                }
            } else {
                const ring = createLoadingIndicator();
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
                const ring = createLoadingIndicator();
                scene.add(ring);
                loadingIndicators.set(title, {
                    ring,
                    pending: new Set([API_CONFIG.markers.pagination])
                });
            } else if (isComplete && loadingIndicators.has(title)) {
                const indicator = loadingIndicators.get(title)!;
                indicator.pending.delete(API_CONFIG.markers.pagination);
                if (indicator.pending.size === 0) {
                    disposeIndicator(scene, indicator);
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
