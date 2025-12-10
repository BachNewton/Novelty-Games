import { useEffect, useRef, useCallback } from 'react';
import { FractalType, FRACTAL_CONFIGS } from '../data/FractalTypes';
import { WORKER_COLORS } from '../data/ColorPalettes';
import { TileManager } from '../logic/TileManager';
import {
    ViewportState,
    createViewportState,
    panViewport,
    zoomViewport,
    resizeViewport
} from '../logic/ViewportState';
import { WorkerStats } from '../logic/WorkerPool';

interface FractalCanvasProps {
    fractalType: FractalType;
    paletteId: string;
    maxIterations: number;
    showWorkerOverlay: boolean;
    juliaReal?: number;
    juliaImag?: number;
    onStatsUpdate?: (stats: {
        workerStats: WorkerStats[];
        tilesCompleted: number;
        totalTiles: number;
        workerCount: number;
    }) => void;
}

export const FractalCanvas: React.FC<FractalCanvasProps> = ({
    fractalType,
    paletteId,
    maxIterations,
    showWorkerOverlay,
    juliaReal,
    juliaImag,
    onStatsUpdate
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const tileManagerRef = useRef<TileManager | null>(null);
    const viewportRef = useRef<ViewportState | null>(null);
    const isDraggingRef = useRef(false);
    const lastMousePosRef = useRef({ x: 0, y: 0 });
    const lastTouchDistanceRef = useRef(0);
    const renderTimeoutRef = useRef<number | null>(null);
    const isInitializedRef = useRef(false);

    // Store current props in refs so callbacks don't need dependencies
    const propsRef = useRef({ fractalType, paletteId, maxIterations, showWorkerOverlay, juliaReal, juliaImag });
    propsRef.current = { fractalType, paletteId, maxIterations, showWorkerOverlay, juliaReal, juliaImag };

    const updateStats = useCallback(() => {
        if (!tileManagerRef.current || !onStatsUpdate) return;

        const pool = tileManagerRef.current.getWorkerPool();
        onStatsUpdate({
            workerStats: pool.getWorkerStats(),
            tilesCompleted: tileManagerRef.current.getCompletedTileCount(),
            totalTiles: tileManagerRef.current.getTileCount(),
            workerCount: pool.getWorkerCount()
        });
    }, [onStatsUpdate]);

    // Initialize canvas and tile manager
    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
        }

        const props = propsRef.current;
        const config = FRACTAL_CONFIGS[props.fractalType];

        // Create or update viewport
        if (!viewportRef.current) {
            viewportRef.current = createViewportState(
                config.defaultCenter.real,
                config.defaultCenter.imag,
                config.defaultZoom,
                rect.width,
                rect.height
            );
        } else {
            viewportRef.current = resizeViewport(
                viewportRef.current,
                rect.width,
                rect.height
            );
        }

        // Clean up old tile manager
        if (tileManagerRef.current) {
            tileManagerRef.current.terminate();
            tileManagerRef.current = null;
        }

        // Create new tile manager
        tileManagerRef.current = new TileManager(
            canvas,
            viewportRef.current,
            {
                fractalType: props.fractalType,
                maxIterations: props.maxIterations,
                paletteId: props.paletteId,
                juliaReal: props.juliaReal ?? config.juliaC?.real,
                juliaImag: props.juliaImag ?? config.juliaC?.imag
            },
            () => {
                // Render complete callback
                if (propsRef.current.showWorkerOverlay && tileManagerRef.current) {
                    tileManagerRef.current.drawWorkerOverlay(WORKER_COLORS);
                }
                updateStats();
            }
        );

        // Initial render
        tileManagerRef.current.render();
        isInitializedRef.current = true;
    }, [updateStats]);

    // Debounced re-render after viewport changes
    const scheduleRender = useCallback(() => {
        if (renderTimeoutRef.current) {
            window.clearTimeout(renderTimeoutRef.current);
        }

        renderTimeoutRef.current = window.setTimeout(() => {
            if (tileManagerRef.current && viewportRef.current) {
                tileManagerRef.current.updateViewport(viewportRef.current);
                tileManagerRef.current.render();
            }
        }, 50);
    }, []);

    // Mouse event handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDraggingRef.current = true;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDraggingRef.current || !viewportRef.current) return;

        const deltaX = e.clientX - lastMousePosRef.current.x;
        const deltaY = e.clientY - lastMousePosRef.current.y;

        viewportRef.current = panViewport(viewportRef.current, deltaX, deltaY);
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };

        scheduleRender();
    }, [scheduleRender]);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
    }, []);

    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        if (!viewportRef.current || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Zoom factor based on scroll direction
        const zoomFactor = e.deltaY < 0 ? 1.2 : 1 / 1.2;

        viewportRef.current = zoomViewport(viewportRef.current, zoomFactor, mouseX, mouseY);
        scheduleRender();
    }, [scheduleRender]);

    // Touch event handlers
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            isDraggingRef.current = true;
            lastMousePosRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        } else if (e.touches.length === 2) {
            // Pinch zoom start
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastTouchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        if (!viewportRef.current || !canvasRef.current) return;

        if (e.touches.length === 1 && isDraggingRef.current) {
            // Pan
            const deltaX = e.touches[0].clientX - lastMousePosRef.current.x;
            const deltaY = e.touches[0].clientY - lastMousePosRef.current.y;

            viewportRef.current = panViewport(viewportRef.current, deltaX, deltaY);
            lastMousePosRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };

            scheduleRender();
        } else if (e.touches.length === 2) {
            // Pinch zoom
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (lastTouchDistanceRef.current > 0) {
                const zoomFactor = distance / lastTouchDistanceRef.current;
                const rect = canvasRef.current.getBoundingClientRect();
                const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
                const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

                viewportRef.current = zoomViewport(viewportRef.current, zoomFactor, centerX, centerY);
                scheduleRender();
            }

            lastTouchDistanceRef.current = distance;
        }
    }, [scheduleRender]);

    const handleTouchEnd = useCallback(() => {
        isDraggingRef.current = false;
        lastTouchDistanceRef.current = 0;
    }, []);

    // Initialize on mount only
    useEffect(() => {
        initCanvas();

        const handleResize = () => {
            initCanvas();
        };

        window.addEventListener('resize', handleResize);

        // Add wheel listener with passive: false to allow preventDefault
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('wheel', handleWheel, { passive: false });
        }

        // Stats update interval
        const statsInterval = setInterval(updateStats, 100);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (canvas) {
                canvas.removeEventListener('wheel', handleWheel);
            }
            clearInterval(statsInterval);
            if (renderTimeoutRef.current) {
                window.clearTimeout(renderTimeoutRef.current);
            }
            if (tileManagerRef.current) {
                tileManagerRef.current.terminate();
                tileManagerRef.current = null;
            }
            isInitializedRef.current = false;
        };
    }, [initCanvas, updateStats, handleWheel]);

    // Handle fractal type changes - reset viewport and re-render
    useEffect(() => {
        if (!isInitializedRef.current || !tileManagerRef.current) return;

        const config = FRACTAL_CONFIGS[fractalType];

        // Reset viewport to default for this fractal
        if (viewportRef.current) {
            viewportRef.current = {
                ...viewportRef.current,
                centerReal: config.defaultCenter.real,
                centerImag: config.defaultCenter.imag,
                zoom: config.defaultZoom
            };
        }

        tileManagerRef.current.updateRenderParams({
            fractalType,
            juliaReal: juliaReal ?? config.juliaC?.real,
            juliaImag: juliaImag ?? config.juliaC?.imag
        });

        if (viewportRef.current) {
            tileManagerRef.current.updateViewport(viewportRef.current);
        }

        tileManagerRef.current.render();
    }, [fractalType, juliaReal, juliaImag]);

    // Handle palette/iterations changes
    useEffect(() => {
        if (!isInitializedRef.current || !tileManagerRef.current) return;

        tileManagerRef.current.updateRenderParams({ paletteId, maxIterations });
        tileManagerRef.current.render();
    }, [paletteId, maxIterations]);

    // Handle overlay toggle
    useEffect(() => {
        if (!isInitializedRef.current || !tileManagerRef.current) return;

        tileManagerRef.current.redrawTiles();
        if (showWorkerOverlay) {
            tileManagerRef.current.drawWorkerOverlay(WORKER_COLORS);
        }
    }, [showWorkerOverlay]);

    const canvasStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        display: 'block',
        cursor: 'grab',
        touchAction: 'none'
    };

    return (
        <canvas
            ref={canvasRef}
            style={canvasStyle}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        />
    );
};
