import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { WikiArticle, ArticleNode, ArticleLink } from '../data/Article';
import { InstancedNodeManager, NodeType } from '../scene/InstancedNodeManager';
import { InstancedLinkManager } from '../scene/InstancedLinkManager';
import { LoadingIndicator, createLoadingIndicator } from '../scene/LoadingIndicatorFactory';
import { CategoryTracker } from './CategoryTracker';
import { ForceSimulation } from './ForceSimulation';
import { createTitleLabel } from '../util/troikaLabelUtils';
import { API_CONFIG } from '../config/apiConfig';

export interface LinkCount {
    count: number;
    isComplete: boolean;
}

export interface GraphControllerCallbacks {
    onArticleCountChange: (count: number) => void;
    onLinkCountChange: (count: number) => void;
    onError: (error: Error) => void;
}

export interface GraphControllerDeps {
    scene: THREE.Scene;
    simulation: ForceSimulation;
    categoryTracker: CategoryTracker;
    nodeManager: InstancedNodeManager;
    linkManager: InstancedLinkManager;
    callbacks: GraphControllerCallbacks;
    selectedArticleRef: { current: string | null };
    updateStatsLabel: (title: string) => void;
}

export interface GraphController {
    // State accessors
    getArticles: () => Map<string, ArticleNode>;
    getLinks: () => ArticleLink[];
    getLoadingIndicators: () => Map<string, LoadingIndicator>;
    hasArticle: (title: string) => boolean;

    // Node operations
    createNewNode: (article: WikiArticle) => void;
    promoteLeafToFullNode: (existingNode: ArticleNode, article: WikiArticle, aliasTitle: string | null) => void;
    findNodeByTitleOrAlias: (title: string, aliases?: string[]) => ExistingNodeResult | null;

    // Link operations
    createLink: (source: string, target: string) => void;
    registerPendingLink: (target: string, source: string) => void;

    // Loading indicator operations
    removeFromLoadingIndicators: (titles: string[]) => void;
    addQueuedIndicator: (sourceTitle: string, queuedTitles: string[]) => void;
    addPaginationIndicator: (title: string) => void;
    removePaginationIndicator: (title: string) => void;
    hasLoadingIndicator: (title: string) => boolean;

    // Progress tracking
    setLinkProgress: (title: string, count: number, isComplete: boolean) => void;
    getLinkProgress: (title: string) => LinkCount | undefined;
}

export interface ExistingNodeResult {
    node: ArticleNode;
    aliasTitle: string | null;
}

function getNodeType(article: WikiArticle): NodeType {
    if (article.leaf) return 'cone';
    if (article.missing) return 'box';
    return 'sphere';
}

function disposeIndicator(scene: THREE.Scene, indicator: LoadingIndicator): void {
    scene.remove(indicator.ring);
    indicator.ring.geometry.dispose();
    (indicator.ring.material as THREE.Material).dispose();
}

export function createGraphController(deps: GraphControllerDeps): GraphController {
    const {
        scene, simulation, categoryTracker, nodeManager, linkManager,
        callbacks, selectedArticleRef, updateStatsLabel
    } = deps;

    // Owned state - no refs needed
    const articles = new Map<string, ArticleNode>();
    const links: ArticleLink[] = [];
    const pendingLinks = new Map<string, Set<string>>();
    const loadingIndicators = new Map<string, LoadingIndicator>();
    const linkCounts = new Map<string, LinkCount>();

    // Helper: dispose a label
    function disposeLabel(label: Text | null): void {
        if (!label) return;
        scene.remove(label);
        label.dispose();
    }

    // Helper: create link (internal implementation)
    function createLinkInternal(source: string, target: string): void {
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
            links.push({ source, target, instanceIndex: biIndex, linkType: 'bidirectional' });
        }

        simulation.addLink(source, target);
        callbacks.onLinkCountChange(links.length);

        if (selectedArticleRef.current && source === selectedArticleRef.current) {
            updateStatsLabel(selectedArticleRef.current);
        }
    }

    // Helper: resolve pending links
    function resolvePendingLinksInternal(article: WikiArticle): void {
        const titlesToCheck = [article.title, ...(article.aliases ?? [])];
        for (const title of titlesToCheck) {
            const pending = pendingLinks.get(title);
            if (pending) {
                for (const sourceTitle of pending) {
                    createLinkInternal(sourceTitle, article.title);
                }
                pendingLinks.delete(title);
            }
        }
    }

    // Helper: find parent ID
    function findParentIdInternal(article: WikiArticle): string | undefined {
        const titlesToCheck = [article.title, ...(article.aliases ?? [])];
        for (const title of titlesToCheck) {
            const pending = pendingLinks.get(title);
            if (pending && pending.size > 0) {
                return pending.values().next().value;
            }
        }
        return undefined;
    }

    return {
        // State accessors
        getArticles: () => articles,
        getLinks: () => links,
        getLoadingIndicators: () => loadingIndicators,
        hasArticle: (title) => articles.has(title),

        // Node operations
        findNodeByTitleOrAlias: (title, aliases) => {
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
        },

        createNewNode: (article) => {
            const nodeType = getNodeType(article);
            let color = 0xffffff; // Default white for leaves/missing

            if (!article.leaf && !article.missing) {
                categoryTracker.registerArticle(article.title, article.categories);
                color = categoryTracker.getArticleColor(article.title);
            }

            const instanceIndex = nodeManager.addNode(nodeType, color);
            const label = createTitleLabel(article.title, article.leaf === true, article.missing === true, scene);

            const node: ArticleNode = {
                article,
                instanceIndex,
                instanceType: nodeType,
                label,
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3()
            };

            articles.set(article.title, node);
            const parentId = findParentIdInternal(article);
            simulation.addNode(article.title, { parentId });
            for (const alias of article.aliases ?? []) {
                articles.set(alias, node);
            }

            resolvePendingLinksInternal(article);
            callbacks.onArticleCountChange(articles.size);
        },

        promoteLeafToFullNode: (existingNode, article, aliasTitle) => {
            // Remove the old label
            disposeLabel(existingNode.label);

            // Hide the old cone instance
            nodeManager.hideInstance(existingNode.instanceType, existingNode.instanceIndex);

            // Create new instance for the promoted node
            categoryTracker.registerArticle(article.title, article.categories);
            const color = categoryTracker.getArticleColor(article.title);
            const nodeType = getNodeType(article);
            const instanceIndex = nodeManager.addNode(nodeType, color);

            const label = createTitleLabel(article.title, false, article.missing === true, scene);

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
                simulation.addNode(article.title, { position: currentPosition });
            } else {
                simulation.addNode(article.title);
            }

            // Store under canonical title and aliases
            articles.set(article.title, existingNode);
            for (const alias of article.aliases ?? []) {
                articles.set(alias, existingNode);
            }

            resolvePendingLinksInternal(article);
        },

        // Link operations
        createLink: createLinkInternal,

        registerPendingLink: (target, source) => {
            if (!pendingLinks.has(target)) {
                pendingLinks.set(target, new Set());
            }
            pendingLinks.get(target)!.add(source);
        },

        // Loading indicator operations
        removeFromLoadingIndicators: (titles) => {
            for (const [sourceTitle, indicator] of loadingIndicators) {
                for (const title of titles) {
                    indicator.pending.delete(title);
                }
                if (indicator.pending.size === 0) {
                    disposeIndicator(scene, indicator);
                    loadingIndicators.delete(sourceTitle);
                }
            }
        },

        addQueuedIndicator: (sourceTitle, queuedTitles) => {
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
        },

        addPaginationIndicator: (title) => {
            if (loadingIndicators.has(title)) return;

            const ring = createLoadingIndicator();
            scene.add(ring);
            loadingIndicators.set(title, {
                ring,
                pending: new Set([API_CONFIG.markers.pagination])
            });
        },

        removePaginationIndicator: (title) => {
            const indicator = loadingIndicators.get(title);
            if (!indicator) return;

            indicator.pending.delete(API_CONFIG.markers.pagination);
            if (indicator.pending.size === 0) {
                disposeIndicator(scene, indicator);
                loadingIndicators.delete(title);
            }
        },

        hasLoadingIndicator: (title) => loadingIndicators.has(title),

        // Progress tracking
        setLinkProgress: (title, count, isComplete) => {
            linkCounts.set(title, { count, isComplete });
        },

        getLinkProgress: (title) => linkCounts.get(title)
    };
}
