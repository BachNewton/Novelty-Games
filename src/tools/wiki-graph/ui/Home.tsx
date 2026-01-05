import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import Stats from 'three/examples/jsm/libs/stats.module';
import { WikiArticle, ArticleNode, ArticleLink } from '../data/Article';
import { createWikiCrawler, WikiCrawler } from '../logic/WikiCrawler';
import { createForceSimulation, ForceSimulation } from '../logic/ForceSimulation';
import { createCategoryTracker, CategoryTracker } from '../logic/CategoryTracker';
import { createCameraAnimator, CameraAnimator } from '../logic/CameraAnimator';
import ProgressPanel from './ProgressPanel';

const START_ARTICLE = 'Finland';
const MINIMUM_FRAME_RATE = 1000 / 25;

const Home: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        labelRenderer: CSS2DRenderer;
        controls: OrbitControls;
        raycaster: THREE.Raycaster;
        mouse: THREE.Vector2;
        stats: Stats;
    } | null>(null);

    const crawlerRef = useRef<WikiCrawler | null>(null);
    const simulationRef = useRef<ForceSimulation | null>(null);
    const categoryTrackerRef = useRef<CategoryTracker | null>(null);
    const cameraAnimatorRef = useRef<CameraAnimator | null>(null);
    const articlesRef = useRef<Map<string, ArticleNode>>(new Map());
    const linksRef = useRef<ArticleLink[]>([]);
    const pendingLinksRef = useRef<Map<string, Set<string>>>(new Map());
    const hoveredMeshRef = useRef<THREE.Mesh | null>(null);
    const loadingIndicatorsRef = useRef<Map<string, { ring: THREE.Mesh, pending: Set<string> }>>(new Map());
    const statsLabelRef = useRef<CSS2DObject | null>(null);
    const selectedArticleRef = useRef<string | null>(START_ARTICLE);
    const linkCountsRef = useRef<Map<string, { count: number, isComplete: boolean }>>(new Map());

    const [articleCount, setArticleCount] = useState(0);
    const [linkCount, setLinkCount] = useState(0);
    const [fetchingCount, setFetchingCount] = useState(0);
    const [pendingQueueSize, setPendingQueueSize] = useState(0);
    const [linkLimit, setLinkLimit] = useState(4);
    const [maxDepth, setMaxDepth] = useState(1);
    const [isRunning, setIsRunning] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState<string | null>(START_ARTICLE);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const crawler = useMemo(() => createWikiCrawler(), []);
    const simulation = useMemo(() => createForceSimulation(), []);
    const categoryTracker = useMemo(() => createCategoryTracker(), []);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        camera.position.set(0, 0, 30);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        containerRef.current.appendChild(renderer.domElement);

        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0';
        labelRenderer.domElement.style.pointerEvents = 'none';
        containerRef.current.appendChild(labelRenderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 5;
        controls.maxDistance = 200;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const stats = new Stats();
        containerRef.current.appendChild(stats.dom);

        sceneRef.current = { scene, camera, renderer, labelRenderer, controls, raycaster, mouse, stats };
        crawlerRef.current = crawler;
        simulationRef.current = simulation;
        categoryTrackerRef.current = categoryTracker;
        cameraAnimatorRef.current = createCameraAnimator(camera, controls);

        function onWindowResize() {
            if (!sceneRef.current) return;
            const { camera, renderer, labelRenderer } = sceneRef.current;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            labelRenderer.setSize(window.innerWidth, window.innerHeight);

            // Update line material resolutions
            for (const link of linksRef.current) {
                const material = link.line.material as LineMaterial;
                material.resolution.set(window.innerWidth, window.innerHeight);
            }
        }

        function onPointerDown(event: PointerEvent) {
            if (!sceneRef.current) return;
            const { camera, raycaster, mouse } = sceneRef.current;

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            const meshes = Array.from(articlesRef.current.values()).map(n => n.mesh);
            const intersects = raycaster.intersectObjects(meshes, false);

            if (intersects.length > 0) {
                const title = intersects[0].object.userData.title as string;

                setSelectedArticle(title);
                selectedArticleRef.current = title;

                const category = categoryTrackerRef.current?.getOptimalCategory(title) ?? null;
                setSelectedCategory(category);

                crawlerRef.current?.expand(title);

                const node = articlesRef.current.get(title);
                if (node && cameraAnimatorRef.current) {
                    cameraAnimatorRef.current.animateTo(node.position.clone());
                }

                // Update stats label after a short delay to allow prioritize to queue links
                setTimeout(() => updateStatsLabel(title), 50);
            }
        }

        function onMouseMove(event: MouseEvent) {
            if (!sceneRef.current) return;
            const { camera, raycaster, mouse } = sceneRef.current;

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            const meshes = Array.from(articlesRef.current.values()).map(n => n.mesh);
            const intersects = raycaster.intersectObjects(meshes, false);

            // Reset previous hovered mesh
            if (hoveredMeshRef.current) {
                const material = hoveredMeshRef.current.material as THREE.MeshStandardMaterial;
                material.emissive.setHex(0x000000);
                hoveredMeshRef.current.scale.setScalar(1);
                hoveredMeshRef.current = null;
            }

            // Highlight new hovered mesh
            if (intersects.length > 0) {
                const mesh = intersects[0].object as THREE.Mesh;
                const material = mesh.material as THREE.MeshStandardMaterial;
                material.emissive.setHex(0x333333);
                mesh.scale.setScalar(1.3);
                hoveredMeshRef.current = mesh;
                renderer.domElement.style.cursor = 'pointer';
            } else {
                renderer.domElement.style.cursor = 'default';
            }
        }

        window.addEventListener('resize', onWindowResize);
        renderer.domElement.addEventListener('pointerdown', onPointerDown);
        renderer.domElement.addEventListener('mousemove', onMouseMove);

        let previousTime = 0;

        function animate(time: DOMHighResTimeStamp) {
            const deltaTime = Math.min(time - previousTime, MINIMUM_FRAME_RATE);
            previousTime = time;

            if (!sceneRef.current) return;
            const { scene, camera, renderer, labelRenderer, controls } = sceneRef.current;

            simulationRef.current?.update(deltaTime);

            for (const [title, node] of articlesRef.current) {
                const pos = simulationRef.current?.getPosition(title);
                if (pos) {
                    node.mesh.position.copy(pos);
                    node.position.copy(pos);

                    // Adjust label based on distance from camera
                    const distance = camera.position.distanceTo(pos);

                    // Scale inversely with distance, baseline at default camera distance (30)
                    const baseDistance = 30;
                    const scale = baseDistance / distance;

                    // Fog-like opacity starting from baseline distance
                    const fogDensity = 0.003;
                    const distanceBeyondBase = Math.max(0, distance - baseDistance);
                    const opacity = Math.exp(-distanceBeyondBase * distanceBeyondBase * fogDensity);

                    const label = node.mesh.children[0] as CSS2DObject;
                    if (label?.element) {
                        label.element.style.opacity = String(opacity);
                        label.element.style.transform = `scale(${scale}) translateY(-20px)`;
                    }
                }
            }

            for (const link of linksRef.current) {
                const sourceNode = articlesRef.current.get(link.source);
                const targetNode = articlesRef.current.get(link.target);
                if (sourceNode && targetNode) {
                    const geometry = link.line.geometry as LineGeometry;
                    geometry.setPositions([
                        sourceNode.position.x, sourceNode.position.y, sourceNode.position.z,
                        targetNode.position.x, targetNode.position.y, targetNode.position.z
                    ]);
                }
            }

            // Rotate loading indicators
            for (const [title, indicator] of loadingIndicatorsRef.current) {
                const node = articlesRef.current.get(title);
                if (node) {
                    indicator.ring.position.copy(node.position);
                    indicator.ring.rotation.x += deltaTime * 0.002;
                    indicator.ring.rotation.y += deltaTime * 0.003;
                }
            }

            cameraAnimatorRef.current?.update(deltaTime);
            controls.update();
            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);
            sceneRef.current?.stats.update();
        }

        renderer.setAnimationLoop(animate);

        return () => {
            window.removeEventListener('resize', onWindowResize);
            renderer.domElement.removeEventListener('pointerdown', onPointerDown);
            renderer.domElement.removeEventListener('mousemove', onMouseMove);
            renderer.setAnimationLoop(null);
            renderer.dispose();
            containerRef.current?.removeChild(renderer.domElement);
            containerRef.current?.removeChild(labelRenderer.domElement);
            containerRef.current?.removeChild(stats.dom);
        };
    }, [crawler, simulation, categoryTracker]);

    useEffect(() => {
        crawler.onArticleFetched((article: WikiArticle) => {
            if (!sceneRef.current || !simulationRef.current || !categoryTrackerRef.current) return;
            const { scene } = sceneRef.current;

            // Remove this article from all loading indicators
            const fetchedTitles = [article.title, ...(article.aliases ?? [])];
            for (const [sourceTitle, indicator] of loadingIndicatorsRef.current) {
                for (const fetchedTitle of fetchedTitles) {
                    indicator.pending.delete(fetchedTitle);
                }
                if (indicator.pending.size === 0) {
                    scene.remove(indicator.ring);
                    indicator.ring.geometry.dispose();
                    (indicator.ring.material as THREE.Material).dispose();
                    loadingIndicatorsRef.current.delete(sourceTitle);
                }
            }

            if (articlesRef.current.has(article.title)) return;

            categoryTrackerRef.current.registerArticle(article.title, article.categories);
            const color = categoryTrackerRef.current.getArticleColor(article.title);

            const geometry = new THREE.SphereGeometry(0.4, 16, 16);
            const material = new THREE.MeshStandardMaterial({
                color,
                roughness: 0.5,
                metalness: 0.3
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.userData = { title: article.title };

            // Create label
            const labelDiv = document.createElement('div');
            labelDiv.textContent = article.title;
            labelDiv.style.color = 'white';
            labelDiv.style.fontSize = '12px';
            labelDiv.style.fontFamily = 'sans-serif';
            labelDiv.style.textShadow = '1px 1px 2px black';
            labelDiv.style.whiteSpace = 'nowrap';
            const label = new CSS2DObject(labelDiv);
            label.position.set(0, 0.75, 0);
            mesh.add(label);

            scene.add(mesh);

            const position = new THREE.Vector3();
            const velocity = new THREE.Vector3();

            const node: ArticleNode = {
                article,
                mesh,
                position,
                velocity
            };

            articlesRef.current.set(article.title, node);
            simulationRef.current.addNode(article.title);

            // Also store under alias titles (redirect sources)
            if (article.aliases) {
                for (const alias of article.aliases) {
                    articlesRef.current.set(alias, node);
                }
            }

            // Check pending links for canonical title and all aliases
            const titlesToCheck = [article.title, ...(article.aliases ?? [])];
            for (const title of titlesToCheck) {
                const pending = pendingLinksRef.current.get(title);
                if (pending) {
                    for (const sourceTitle of pending) {
                        createLink(sourceTitle, article.title);
                    }
                    pendingLinksRef.current.delete(title);
                }
            }

            setArticleCount(articlesRef.current.size);
        });

        crawler.onLinkDiscovered((source: string, target: string) => {
            if (articlesRef.current.has(target)) {
                createLink(source, target);
            } else {
                if (!pendingLinksRef.current.has(target)) {
                    pendingLinksRef.current.set(target, new Set());
                }
                pendingLinksRef.current.get(target)!.add(source);
            }
        });

        crawler.onRequestStateChange((count: number, batchSize: number) => {
            setFetchingCount(batchSize);
            setPendingQueueSize(crawler.getPendingQueueSize());
        });

        crawler.onLinksQueued((sourceTitle: string, queuedTitles: string[]) => {
            if (!sceneRef.current) return;
            const { scene } = sceneRef.current;

            const existing = loadingIndicatorsRef.current.get(sourceTitle);
            if (existing) {
                // Add new pending links to existing indicator
                for (const title of queuedTitles) {
                    existing.pending.add(title);
                }
            } else {
                // Create new loading indicator ring
                const ringGeometry = new THREE.TorusGeometry(0.6, 0.05, 8, 32);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: 0x4ECDC4,
                    transparent: true,
                    opacity: 0.8
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                scene.add(ring);

                loadingIndicatorsRef.current.set(sourceTitle, {
                    ring,
                    pending: new Set(queuedTitles)
                });
            }
        });

        crawler.onFetchFailed((failedTitles: string[]) => {
            if (!sceneRef.current) return;
            const { scene } = sceneRef.current;

            // Remove failed titles from all loading indicators
            for (const [sourceTitle, indicator] of loadingIndicatorsRef.current) {
                for (const failedTitle of failedTitles) {
                    indicator.pending.delete(failedTitle);
                }
                if (indicator.pending.size === 0) {
                    scene.remove(indicator.ring);
                    indicator.ring.geometry.dispose();
                    (indicator.ring.material as THREE.Material).dispose();
                    loadingIndicatorsRef.current.delete(sourceTitle);
                }
            }
        });

        crawler.onFetchProgress((title: string, linkCount: number, isComplete: boolean) => {
            linkCountsRef.current.set(title, { count: linkCount, isComplete });

            // Update stats label if this is the selected article
            if (selectedArticleRef.current === title) {
                updateStatsLabel(title);
            }

            // Show loading ring on the node while paginating
            if (!sceneRef.current) return;
            const { scene } = sceneRef.current;
            const node = articlesRef.current.get(title);

            if (node && !isComplete && !loadingIndicatorsRef.current.has(title)) {
                // Create loading indicator ring for pagination
                const ringGeometry = new THREE.TorusGeometry(0.6, 0.05, 8, 32);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: 0x4ECDC4,
                    transparent: true,
                    opacity: 0.8
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                scene.add(ring);

                loadingIndicatorsRef.current.set(title, {
                    ring,
                    pending: new Set(['__pagination__']) // Special marker for pagination
                });
            } else if (isComplete && loadingIndicatorsRef.current.has(title)) {
                const indicator = loadingIndicatorsRef.current.get(title)!;
                // Remove pagination marker
                indicator.pending.delete('__pagination__');
                // If no other pending items, remove the ring
                if (indicator.pending.size === 0) {
                    scene.remove(indicator.ring);
                    indicator.ring.geometry.dispose();
                    (indicator.ring.material as THREE.Material).dispose();
                    loadingIndicatorsRef.current.delete(title);
                }
            }
        });

        crawler.start(START_ARTICLE);

        return () => {
            crawler.stop();
        };
    }, [crawler]);

    function createLink(source: string, target: string) {
        if (!sceneRef.current || !simulationRef.current) return;
        const { scene } = sceneRef.current;

        const existing = linksRef.current.find(
            l => l.source === source && l.target === target
        );
        if (existing) return;

        const sourceNode = articlesRef.current.get(source);
        const targetNode = articlesRef.current.get(target);
        if (!sourceNode || !targetNode) return;

        // Check if reverse link exists (bidirectional)
        const reverseLink = linksRef.current.find(
            l => l.source === target && l.target === source
        );

        const geometry = new LineGeometry();
        geometry.setPositions([0, 0, 0, 0, 0, 0]);

        // Set vertex colors: grey (0.4, 0.4, 0.5) to blue (0.3, 0.8, 0.77)
        // If bidirectional, both ends are blue
        const grey = [0.4, 0.4, 0.5];
        const blue = [0.3, 0.8, 0.77];
        const startColor = reverseLink ? blue : grey;
        const endColor = blue;
        geometry.setColors([...startColor, ...endColor]);

        const material = new LineMaterial({
            vertexColors: true,
            linewidth: 1,
            transparent: true,
            opacity: 0.6,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        });

        const line = new Line2(geometry, material);
        line.computeLineDistances();
        scene.add(line);

        linksRef.current.push({ source, target, line });
        simulationRef.current.addLink(source, target);

        // If reverse link exists, update its colors to be blue on both ends
        if (reverseLink) {
            const reverseGeometry = reverseLink.line.geometry as LineGeometry;
            reverseGeometry.setColors([...blue, ...blue]);
        }

        setLinkCount(linksRef.current.length);

        // Update stats label if this link involves the selected article
        if (selectedArticleRef.current && source === selectedArticleRef.current) {
            updateStatsLabel(selectedArticleRef.current);
        }
    }

    function updateStatsLabel(title: string | null) {
        if (!sceneRef.current) return;

        // Remove existing stats label
        if (statsLabelRef.current) {
            statsLabelRef.current.parent?.remove(statsLabelRef.current);
            statsLabelRef.current.element.remove();
            statsLabelRef.current = null;
        }

        if (!title) return;

        const node = articlesRef.current.get(title);

        // Count outgoing lines from this node (visualized links)
        const visualizedLinks = linksRef.current.filter(link => link.source === title).length;

        // Get total link count - either from progress tracking or completed article
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
            // Node doesn't exist yet, show what we know from progress
            return;
        }

        // Format: (visualized/total) or (visualized/total+) if still loading
        const totalStr = isComplete ? String(totalLinks) : `${totalLinks}+`;

        // Create stats label
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
    }

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
