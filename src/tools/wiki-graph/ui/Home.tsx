import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons';
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

    const [articleCount, setArticleCount] = useState(0);
    const [linkCount, setLinkCount] = useState(0);
    const [activeRequests, setActiveRequests] = useState(0);
    const [priorityQueueSize, setPriorityQueueSize] = useState(0);
    const [pendingQueueSize, setPendingQueueSize] = useState(0);
    const [linkLimit, setLinkLimit] = useState(4);
    const [maxDepth, setMaxDepth] = useState(1);
    const [isRunning, setIsRunning] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
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

        sceneRef.current = { scene, camera, renderer, controls, raycaster, mouse, stats };
        crawlerRef.current = crawler;
        simulationRef.current = simulation;
        categoryTrackerRef.current = categoryTracker;
        cameraAnimatorRef.current = createCameraAnimator(camera, controls);

        function onWindowResize() {
            if (!sceneRef.current) return;
            const { camera, renderer } = sceneRef.current;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);

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

                const category = categoryTrackerRef.current?.getOptimalCategory(title) ?? null;
                setSelectedCategory(category);

                crawlerRef.current?.prioritize(title);

                const node = articlesRef.current.get(title);
                if (node && cameraAnimatorRef.current) {
                    cameraAnimatorRef.current.animateTo(node.position.clone());
                }
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
            const { scene, camera, renderer, controls } = sceneRef.current;

            simulationRef.current?.update(deltaTime);

            for (const [title, node] of articlesRef.current) {
                const pos = simulationRef.current?.getPosition(title);
                if (pos) {
                    node.mesh.position.copy(pos);
                    node.position.copy(pos);
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

            cameraAnimatorRef.current?.update(deltaTime);
            controls.update();
            renderer.render(scene, camera);
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
            containerRef.current?.removeChild(stats.dom);
        };
    }, [crawler, simulation, categoryTracker]);

    useEffect(() => {
        crawler.onArticleFetched((article: WikiArticle) => {
            if (!sceneRef.current || !simulationRef.current || !categoryTrackerRef.current) return;
            const { scene } = sceneRef.current;

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

        crawler.onRequestStateChange((count: number) => {
            setActiveRequests(count);
            setPriorityQueueSize(crawler.getPriorityQueueSize());
            setPendingQueueSize(crawler.getPendingQueueSize());
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

        const geometry = new LineGeometry();
        geometry.setPositions([0, 0, 0, 0, 0, 0]);

        const material = new LineMaterial({
            color: 0x666688,
            linewidth: 1,
            transparent: true,
            opacity: 0.4,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        });

        const line = new Line2(geometry, material);
        line.computeLineDistances();
        scene.add(line);

        linksRef.current.push({ source, target, line });
        simulationRef.current.addLink(source, target);

        setLinkCount(linksRef.current.length);
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
                activeRequests={activeRequests}
                priorityQueueSize={priorityQueueSize}
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
