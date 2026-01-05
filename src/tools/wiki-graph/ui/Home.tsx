import { useRef, useState, useMemo, useCallback } from 'react';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { ArticleNode, ArticleLink } from '../data/Article';
import { createWikiCrawler } from '../logic/WikiCrawler';
import { createForceSimulation } from '../logic/ForceSimulation';
import { createCategoryTracker } from '../logic/CategoryTracker';
import { createCameraAnimator, CameraAnimator } from '../logic/CameraAnimator';
import { createNodeFactory, LoadingIndicator } from '../scene/NodeFactory';
import { createLinkFactory } from '../scene/LinkFactory';
import { useThreeScene } from '../hooks/useThreeScene';
import { useAnimationLoop } from '../hooks/useAnimationLoop';
import { useMouseInteraction } from '../hooks/useMouseInteraction';
import { useCrawlerSubscriptions } from '../hooks/useCrawlerSubscriptions';
import ProgressPanel from './ProgressPanel';

const START_ARTICLE = 'Finland';

interface LinkCount {
    count: number;
    isComplete: boolean;
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
    const [linkLimit, setLinkLimit] = useState(4);
    const [maxDepth, setMaxDepth] = useState(1);
    const [isRunning, setIsRunning] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState<string | null>(START_ARTICLE);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Logic instances
    const crawler = useMemo(() => createWikiCrawler(), []);
    const simulation = useMemo(() => createForceSimulation(), []);
    const categoryTracker = useMemo(() => createCategoryTracker(), []);
    const nodeFactory = useMemo(() => createNodeFactory(), []);
    const linkFactory = useMemo(() => createLinkFactory(), []);

    // Scene setup
    const { sceneManager, isReady } = useThreeScene(containerRef);

    // Initialize camera animator when scene is ready
    useMemo(() => {
        if (isReady && sceneManager) {
            const { camera, controls } = sceneManager.getComponents();
            cameraAnimatorRef.current = createCameraAnimator(camera, controls);
        }
    }, [isReady, sceneManager]);

    // Stats label management
    const updateStatsLabel = useCallback((title: string | null) => {
        if (!sceneManager) return;

        // Remove existing stats label
        if (statsLabelRef.current) {
            statsLabelRef.current.parent?.remove(statsLabelRef.current);
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
        statsDiv.style.color = '#4ECDC4';
        statsDiv.style.fontSize = '10px';
        statsDiv.style.fontFamily = 'sans-serif';
        statsDiv.style.textShadow = '1px 1px 2px black';
        statsDiv.style.whiteSpace = 'nowrap';

        const statsLabel = new CSS2DObject(statsDiv);
        statsLabel.position.set(0, 1.1, 0);

        if (node) {
            node.mesh.add(statsLabel);
        }
        statsLabelRef.current = statsLabel;
    }, [sceneManager]);

    // Article click handler
    const handleArticleClick = useCallback((title: string) => {
        setSelectedArticle(title);
        selectedArticleRef.current = title;

        const category = categoryTracker.getOptimalCategory(title) ?? null;
        setSelectedCategory(category);

        crawler.expand(title);

        const node = articlesRef.current.get(title);
        if (node && cameraAnimatorRef.current) {
            cameraAnimatorRef.current.animateTo(node.position.clone());
        }

        setTimeout(() => updateStatsLabel(title), 50);
    }, [categoryTracker, crawler, updateStatsLabel]);

    // Mouse interaction
    useMouseInteraction({
        sceneManager,
        nodeFactory,
        articlesRef,
        onArticleClick: handleArticleClick
    });

    // Crawler subscriptions
    useCrawlerSubscriptions({
        crawler,
        sceneManager,
        simulation,
        categoryTracker,
        nodeFactory,
        linkFactory,
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
        startArticle: START_ARTICLE
    });

    // Animation loop
    useAnimationLoop({
        sceneManager,
        simulation,
        cameraAnimator: cameraAnimatorRef.current,
        nodeFactory,
        linkFactory,
        articlesRef,
        linksRef,
        loadingIndicatorsRef
    });

    // UI handlers
    function handleToggle() {
        if (isRunning) {
            crawler.stop();
            setIsRunning(false);
        } else {
            crawler.resume();
            setIsRunning(true);
        }
    }

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
                linkCount={linkCount}
                fetchingCount={fetchingCount}
                pendingQueueSize={pendingQueueSize}
                linkLimit={linkLimit}
                maxDepth={maxDepth}
                isRunning={isRunning}
                selectedArticle={selectedArticle}
                selectedCategory={selectedCategory}
                onToggle={handleToggle}
                onLinkLimitChange={handleLinkLimitChange}
                onMaxDepthChange={handleMaxDepthChange}
            />
        </div>
    );
};

export default Home;
