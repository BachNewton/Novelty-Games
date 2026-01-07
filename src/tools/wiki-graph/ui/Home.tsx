import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { ArticleNode, ArticleLink } from '../data/Article';
import { createWikiCrawler, DEFAULT_LINK_LIMIT, DEFAULT_MAX_DEPTH } from '../logic/WikiCrawler';
import { createForceSimulation } from '../logic/ForceSimulation';
import { createCategoryTracker } from '../logic/CategoryTracker';
import { createRealWikiFetcher } from '../logic/networking/RealWikiFetcher';
import { createMockWikiFetcher, MockWikiFetcher } from '../logic/networking/MockWikiFetcher';
import { PHYSICS_CONTROLS } from '../config/physicsConfig';
import { createStorer, StorageKey } from '../../../util/Storage';
import { createCameraAnimator, CameraAnimator } from '../logic/CameraAnimator';
import { LoadingIndicator } from '../scene/LoadingIndicatorFactory';
import { createInstancedNodeManager } from '../scene/InstancedNodeManager';
import { createInstancedLinkManager } from '../scene/InstancedLinkManager';
import { DEFAULT_CAMERA_DISTANCE } from '../scene/SceneManager';
import { API_CONFIG } from '../config/apiConfig';
import { UI_CONFIG } from '../config/uiConfig';
import { LABEL_CONFIG } from '../config/labelConfig';
import { SCENE_CONFIG } from '../config/sceneConfig';
import { useThreeScene } from '../hooks/useThreeScene';
import { useAnimationLoop } from '../hooks/useAnimationLoop';
import { useMouseInteraction } from '../hooks/useMouseInteraction';
import { useCrawlerSubscriptions } from '../hooks/useCrawlerSubscriptions';
import ProgressPanel from './ProgressPanel';

interface ErrorBoundaryState {
    error: Error | null;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error) {
        return { error };
    }

    render() {
        if (this.state.error) {
            return (
                <div style={{
                    width: '100%',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: UI_CONFIG.error.background,
                    color: 'white',
                    fontFamily: 'monospace',
                    padding: '20px',
                    boxSizing: 'border-box'
                }}>
                    <div style={{
                        maxWidth: '600px',
                        backgroundColor: UI_CONFIG.error.overlay,
                        border: `1px solid ${UI_CONFIG.error.border}`,
                        borderRadius: '8px',
                        padding: '20px'
                    }}>
                        <h2 style={{ color: UI_CONFIG.error.text, marginTop: 0 }}>Error</h2>
                        <pre style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            margin: 0
                        }}>
                            {this.state.error.message}
                        </pre>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const START_ARTICLE = API_CONFIG.crawling.startArticle;

interface LinkCount {
    count: number;
    isComplete: boolean;
}

interface WikiGraphSettings {
    useMockData: boolean;
    mockDelay: number;
}

const Home: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Graph data refs
    const articlesRef = useRef<Map<string, ArticleNode>>(new Map());
    const linksRef = useRef<ArticleLink[]>([]);
    const pendingLinksRef = useRef<Map<string, Set<string>>>(new Map());
    const loadingIndicatorsRef = useRef<Map<string, LoadingIndicator>>(new Map());
    const linkCountsRef = useRef<Map<string, LinkCount>>(new Map());
    const selectedArticleRef = useRef<string | null>(START_ARTICLE);
    const statsLabelRef = useRef<CSS2DObject | null>(null);
    const cameraAnimatorRef = useRef<CameraAnimator | null>(null);

    // UI state
    const [articleCount, setArticleCount] = useState(0);
    const [linkCount, setLinkCount] = useState(0);
    const [fetchingCount, setFetchingCount] = useState(0);
    const [pendingQueueSize, setPendingQueueSize] = useState(0);
    const [linkLimit, setLinkLimit] = useState(DEFAULT_LINK_LIMIT);
    const [maxDepth, setMaxDepth] = useState(DEFAULT_MAX_DEPTH);
    const [selectedArticle, setSelectedArticle] = useState<string | null>(START_ARTICLE);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [error, setError] = useState<Error | null>(null);

    // Physics state (session-only, not persisted)
    const [springStrength, setSpringStrength] = useState(PHYSICS_CONTROLS.springStrength.default);
    const [springLength, setSpringLength] = useState(PHYSICS_CONTROLS.springLength.default);
    const [repulsionStrength, setRepulsionStrength] = useState(PHYSICS_CONTROLS.repulsionStrength.default);
    const [centeringStrength, setCenteringStrength] = useState(PHYSICS_CONTROLS.centeringStrength.default);
    const [damping, setDamping] = useState(PHYSICS_CONTROLS.damping.default);
    const [maxVelocity, setMaxVelocity] = useState(PHYSICS_CONTROLS.maxVelocity.default);
    const [nodeLimit, setNodeLimit] = useState(PHYSICS_CONTROLS.nodeLimit.default);
    const [forceUnstable, setForceUnstable] = useState(true);

    // Network mode state
    const [useMockData, setUseMockData] = useState(false);
    const [mockDelay, setMockDelay] = useState(API_CONFIG.mock.delay.default);
    const mockFetcherRef = useRef<MockWikiFetcher | null>(null);

    // Storage for settings
    const settingsStorer = useMemo(() => createStorer<WikiGraphSettings>(StorageKey.WIKI_GRAPH), []);

    // Logic instances
    const crawler = useMemo(() => {
        if (useMockData) {
            const mockFetcher = createMockWikiFetcher();
            mockFetcher.setDelay(mockDelay);
            mockFetcherRef.current = mockFetcher;
            return createWikiCrawler(mockFetcher);
        } else {
            mockFetcherRef.current = null;
            return createWikiCrawler(createRealWikiFetcher());
        }
    }, [useMockData]);
    const simulation = useMemo(() => createForceSimulation(), []);
    const categoryTracker = useMemo(() => createCategoryTracker(), []);
    const nodeManager = useMemo(() => createInstancedNodeManager(), []);
    const linkManager = useMemo(() => createInstancedLinkManager(), []);

    // Derived counts (recomputed when articleCount changes)
    const { nodeCount, leafCount } = useMemo(() => {
        let nodes = 0;
        let leaves = 0;
        for (const article of articlesRef.current.values()) {
            if (article.article.leaf) {
                leaves++;
            } else {
                nodes++;
            }
        }
        return { nodeCount: nodes, leafCount: leaves };
    }, [articleCount]);

    // Scene setup
    const { sceneManager, isReady } = useThreeScene(containerRef);

    // Initialize camera animator and add instanced meshes when scene is ready
    useEffect(() => {
        if (isReady && sceneManager) {
            const { scene, camera, controls } = sceneManager.getComponents();
            cameraAnimatorRef.current = createCameraAnimator(camera, controls);

            // Add instanced node meshes to scene
            for (const mesh of nodeManager.getMeshes()) {
                scene.add(mesh);
            }

            // Add instanced link meshes to scene
            for (const mesh of linkManager.getMeshes()) {
                scene.add(mesh);
            }
        }
    }, [isReady, sceneManager, nodeManager, linkManager]);

    // Stats label management
    const updateStatsLabel = useCallback((title: string | null) => {
        if (!sceneManager) return;

        const { scene } = sceneManager.getComponents();

        // Remove existing stats label
        if (statsLabelRef.current) {
            scene.remove(statsLabelRef.current);
            statsLabelRef.current.element.remove();
            statsLabelRef.current = null;
        }

        if (!title) return;

        const node = articlesRef.current.get(title);
        const visualizedLinks = linksRef.current.filter(link => link.source === title).length;

        let totalLinks: number;
        let isComplete: boolean;
        const progress = linkCountsRef.current.get(title);
        if (progress) {
            totalLinks = progress.count;
            isComplete = progress.isComplete;
        } else if (node) {
            totalLinks = node.article.links.length;
            isComplete = true;
        } else {
            return;
        }

        const totalStr = isComplete ? String(totalLinks) : `${totalLinks}+`;

        const statsDiv = document.createElement('div');
        statsDiv.textContent = `(${visualizedLinks}/${totalStr})`;
        statsDiv.style.color = LABEL_CONFIG.stats.color;
        statsDiv.style.fontSize = '10px';
        statsDiv.style.fontFamily = 'sans-serif';
        statsDiv.style.textShadow = '1px 1px 2px black';
        statsDiv.style.whiteSpace = 'nowrap';

        const statsLabel = new CSS2DObject(statsDiv);
        // Position in world space (will be updated in animation loop)
        if (node) {
            statsLabel.position.set(node.position.x, node.position.y + LABEL_CONFIG.stats.worldYOffset, node.position.z);
            scene.add(statsLabel);
        }
        statsLabelRef.current = statsLabel;
    }, [sceneManager]);

    // Article click handler
    const handleArticleClick = useCallback((title: string) => {
        setSelectedArticle(title);
        selectedArticleRef.current = title;

        const node = articlesRef.current.get(title);

        // Check if this is a leaf node
        if (node?.article.leaf) {
            // Promote the leaf to a full node - stats will show after promotion via onFetchProgress
            crawler.promoteLeaf(title);
        } else {
            // Expand an existing full node
            const category = categoryTracker.getOptimalCategory(title) ?? null;
            setSelectedCategory(category);
            crawler.expand(title);
            updateStatsLabel(title);
        }

        if (node && cameraAnimatorRef.current) {
            cameraAnimatorRef.current.animateTo(node.position.clone());
        }
    }, [categoryTracker, crawler, updateStatsLabel]);

    // Physics parameter handlers
    const handleSpringStrengthChange = useCallback((value: number) => {
        setSpringStrength(value);
        simulation.updateConfig({ springStrength: value });
    }, [simulation]);

    const handleSpringLengthChange = useCallback((value: number) => {
        setSpringLength(value);
        simulation.updateConfig({ springLength: value });
    }, [simulation]);

    const handleRepulsionStrengthChange = useCallback((value: number) => {
        setRepulsionStrength(value);
        simulation.updateConfig({ repulsionStrength: value });
    }, [simulation]);

    const handleCenteringStrengthChange = useCallback((value: number) => {
        setCenteringStrength(value);
        simulation.updateConfig({ centeringStrength: value });
    }, [simulation]);

    const handleDampingChange = useCallback((value: number) => {
        setDamping(value);
        simulation.updateConfig({ damping: value });
    }, [simulation]);

    const handleMaxVelocityChange = useCallback((value: number) => {
        setMaxVelocity(value);
        simulation.updateConfig({ maxVelocity: value });
    }, [simulation]);

    const handleNodeLimitChange = useCallback((value: number) => {
        setNodeLimit(value);
        simulation.updateConfig({ nodeLimit: value });
    }, [simulation]);

    const handleForceUnstableChange = useCallback((value: boolean) => {
        setForceUnstable(value);
        simulation.setForceUnstable(value);
    }, [simulation]);

    // Network mode toggle handler - save and refresh for clean state
    const handleMockDataToggle = useCallback((enabled: boolean) => {
        settingsStorer.save({ useMockData: enabled, mockDelay });
        window.location.reload();
    }, [settingsStorer, mockDelay]);

    // Mock delay handler - updates fetcher in real-time and saves to storage
    const handleMockDelayChange = useCallback((value: number) => {
        setMockDelay(value);
        mockFetcherRef.current?.setDelay(value);
        settingsStorer.save({ useMockData, mockDelay: value });
    }, [settingsStorer, useMockData]);

    // Load settings from localStorage on mount
    useEffect(() => {
        const settings = settingsStorer.loadSync();
        if (settings) {
            setUseMockData(settings.useMockData ?? false);
            setMockDelay(settings.mockDelay ?? API_CONFIG.mock.delay.default);
        }
    }, [settingsStorer]);

    // Mouse interaction
    useMouseInteraction({
        sceneManager,
        nodeManager,
        articlesRef,
        onArticleClick: handleArticleClick
    });

    // Crawler subscriptions
    useCrawlerSubscriptions({
        crawler,
        sceneManager,
        simulation,
        categoryTracker,
        nodeManager,
        linkManager,
        articlesRef,
        linksRef,
        pendingLinksRef,
        loadingIndicatorsRef,
        linkCountsRef,
        selectedArticleRef,
        setArticleCount,
        setLinkCount,
        setFetchingCount,
        setPendingQueueSize,
        updateStatsLabel,
        onError: setError,
        startArticle: START_ARTICLE
    });

    // Animation loop
    useAnimationLoop({
        sceneManager,
        simulation,
        cameraAnimator: cameraAnimatorRef.current,
        nodeManager,
        linkManager,
        articlesRef,
        linksRef,
        loadingIndicatorsRef,
        statsLabelRef,
        selectedArticleRef,
        fogDensity: SCENE_CONFIG.fog.density,
        baseDistance: DEFAULT_CAMERA_DISTANCE,
        labelScaleFactor: LABEL_CONFIG.fog.scaleFactor
    });

    // UI handlers
    function handleLinkLimitChange(limit: number) {
        setLinkLimit(limit);
        crawler.setLinkLimit(limit);
    }

    function handleMaxDepthChange(depth: number) {
        setMaxDepth(depth);
        crawler.setMaxDepth(depth);
    }

    return (
        <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
            <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
            <ProgressPanel
                articleCount={articleCount}
                nodeCount={nodeCount}
                leafCount={leafCount}
                linkCount={linkCount}
                fetchingCount={fetchingCount}
                pendingQueueSize={pendingQueueSize}
                linkLimit={linkLimit}
                maxDepth={maxDepth}
                selectedArticle={selectedArticle}
                selectedCategory={selectedCategory}
                onLinkLimitChange={handleLinkLimitChange}
                onMaxDepthChange={handleMaxDepthChange}
                springStrength={springStrength}
                springLength={springLength}
                repulsionStrength={repulsionStrength}
                centeringStrength={centeringStrength}
                damping={damping}
                maxVelocity={maxVelocity}
                nodeLimit={nodeLimit}
                forceUnstable={forceUnstable}
                onForceUnstableChange={handleForceUnstableChange}
                onSpringStrengthChange={handleSpringStrengthChange}
                onSpringLengthChange={handleSpringLengthChange}
                onRepulsionStrengthChange={handleRepulsionStrengthChange}
                onCenteringStrengthChange={handleCenteringStrengthChange}
                onDampingChange={handleDampingChange}
                onMaxVelocityChange={handleMaxVelocityChange}
                onNodeLimitChange={handleNodeLimitChange}
                useMockData={useMockData}
                onMockDataToggle={handleMockDataToggle}
                mockDelay={mockDelay}
                onMockDelayChange={handleMockDelayChange}
            />
            {error && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    zIndex: 1000
                }}>
                    <div style={{
                        maxWidth: '600px',
                        backgroundColor: UI_CONFIG.error.background,
                        border: `1px solid ${UI_CONFIG.error.border}`,
                        borderRadius: '8px',
                        padding: '20px',
                        color: 'white',
                        fontFamily: 'monospace'
                    }}>
                        <h2 style={{ color: UI_CONFIG.error.text, marginTop: 0 }}>Error</h2>
                        <pre style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            margin: 0
                        }}>
                            {error.message}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

const HomeWithErrorBoundary: React.FC = () => (
    <ErrorBoundary>
        <Home />
    </ErrorBoundary>
);

export default HomeWithErrorBoundary;
