import { useEffect, useRef, useCallback, useState } from 'react';
import { FractalType, FRACTAL_CONFIGS } from '../data/FractalTypes';
import { createRendererManager, RendererManager } from '../logic/RendererManager';
import {
    ArbitraryCoordinate,
    createArbitraryCoordinate,
    pan as panCoord,
    zoomAt,
    toNumbers,
    toStrings
} from '../logic/ArbitraryCoordinate';
import { RenderMode, RenderProgress } from '../logic/FractalRenderer';
import { ZoomIndicator } from './ZoomIndicator';

interface FractalCanvasProps {
    fractalType: FractalType;
    paletteId: string;
    maxIterations: number;
    juliaReal?: number;
    juliaImag?: number;
}

export const FractalCanvas: React.FC<FractalCanvasProps> = ({
    fractalType,
    paletteId,
    maxIterations,
    juliaReal,
    juliaImag
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const gpuCanvasRef = useRef<HTMLCanvasElement>(null);
    const cpuCanvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<RendererManager | null>(null);
    const viewportRef = useRef<ArbitraryCoordinate | null>(null);
    const isDraggingRef = useRef(false);
    const lastMousePosRef = useRef({ x: 0, y: 0 });
    const lastTouchDistanceRef = useRef(0);
    const animationFrameRef = useRef<number | null>(null);

    const [renderMode, setRenderMode] = useState<RenderMode>('gpu');
    const [renderProgress, setRenderProgress] = useState<RenderProgress | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [precisionMode, setPrecisionMode] = useState<'float' | 'arbitrary'>('float');

    // Store props in ref for use in callbacks
    const propsRef = useRef({ fractalType, paletteId, maxIterations, juliaReal, juliaImag });
    propsRef.current = { fractalType, paletteId, maxIterations, juliaReal, juliaImag };

    // Render the fractal
    const render = useCallback(() => {
        if (!rendererRef.current || !viewportRef.current || !gpuCanvasRef.current) return;

        const props = propsRef.current;
        const config = FRACTAL_CONFIGS[props.fractalType];
        const viewport = viewportRef.current;

        // Dynamic iterations based on zoom
        const zoomNum = viewport.zoom.toNumber();
        const zoomLevel = Math.log10(zoomNum);

        // Update zoom level and precision mode for UI
        setZoomLevel(zoomNum);
        setPrecisionMode(zoomNum >= 1e16 ? 'arbitrary' : 'float');
        const dynamicIterations = Math.min(
            10000,
            Math.max(props.maxIterations, Math.floor(props.maxIterations * (1 + zoomLevel * 0.5)))
        );

        const numbers = toNumbers(viewport);
        const strings = toStrings(viewport);

        rendererRef.current.render({
            ...numbers,
            ...strings,
            maxIterations: dynamicIterations,
            fractalType: props.fractalType,
            paletteId: props.paletteId,
            juliaReal: props.juliaReal ?? config.juliaC?.real ?? -0.7,
            juliaImag: props.juliaImag ?? config.juliaC?.imag ?? 0.27015
        });
    }, []);

    // Schedule render on next animation frame (debounced)
    const scheduleRender = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(() => {
            render();
            animationFrameRef.current = null;
        });
    }, [render]);

    // Initialize canvas and renderer
    const initCanvas = useCallback(() => {
        const container = containerRef.current;
        const gpuCanvas = gpuCanvasRef.current;
        const cpuCanvas = cpuCanvasRef.current;
        if (!container || !gpuCanvas || !cpuCanvas) return;

        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);

        // Initialize or resize renderer
        if (!rendererRef.current) {
            try {
                rendererRef.current = createRendererManager(gpuCanvas, cpuCanvas);
                rendererRef.current.setOnModeChange(setRenderMode);
                rendererRef.current.setOnProgress(setRenderProgress);
            } catch (e) {
                console.error('Failed to initialize renderer:', e);
                return;
            }
        }

        rendererRef.current.resize(width, height);

        // Initialize viewport if needed
        const props = propsRef.current;
        const config = FRACTAL_CONFIGS[props.fractalType];

        if (!viewportRef.current) {
            viewportRef.current = createArbitraryCoordinate(
                config.defaultCenter.real,
                config.defaultCenter.imag,
                config.defaultZoom
            );
        }

        render();
    }, [render]);

    // Pan the viewport
    const pan = useCallback((deltaX: number, deltaY: number) => {
        if (!viewportRef.current) return;

        viewportRef.current = panCoord(viewportRef.current, deltaX, deltaY);
        scheduleRender();
    }, [scheduleRender]);

    // Zoom the viewport
    const zoom = useCallback((factor: number, screenX: number, screenY: number) => {
        if (!viewportRef.current || !containerRef.current) return;

        const container = containerRef.current;
        const rect = container.getBoundingClientRect();

        // Get position in canvas coordinates
        const canvasX = screenX - rect.left;
        const canvasY = screenY - rect.top;

        // Apply zoom using arbitrary precision
        const newViewport = zoomAt(
            viewportRef.current,
            factor,
            canvasX,
            canvasY,
            rect.width,
            rect.height
        );

        // Enforce minimum zoom of 10
        const newZoomNum = newViewport.zoom.toNumber();
        if (newZoomNum < 10) {
            return;
        }

        viewportRef.current = newViewport;
        scheduleRender();
    }, [scheduleRender]);

    // Mouse handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDraggingRef.current = true;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDraggingRef.current) return;

        const deltaX = e.clientX - lastMousePosRef.current.x;
        const deltaY = e.clientY - lastMousePosRef.current.y;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };

        pan(deltaX, deltaY);
    }, [pan]);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
    }, []);

    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
        zoom(factor, e.clientX, e.clientY);
    }, [zoom]);

    // Touch handlers
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            isDraggingRef.current = true;
            lastMousePosRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastTouchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        e.preventDefault();

        if (e.touches.length === 1 && isDraggingRef.current) {
            const deltaX = e.touches[0].clientX - lastMousePosRef.current.x;
            const deltaY = e.touches[0].clientY - lastMousePosRef.current.y;
            lastMousePosRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            pan(deltaX, deltaY);
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (lastTouchDistanceRef.current > 0) {
                const factor = distance / lastTouchDistanceRef.current;
                const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                zoom(factor, centerX, centerY);
            }

            lastTouchDistanceRef.current = distance;
        }
    }, [pan, zoom]);

    const handleTouchEnd = useCallback(() => {
        isDraggingRef.current = false;
        lastTouchDistanceRef.current = 0;
    }, []);

    // Initialize on mount
    useEffect(() => {
        initCanvas();

        const handleResize = () => initCanvas();
        window.addEventListener('resize', handleResize);

        // Add wheel listener with passive: false to container
        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (rendererRef.current) {
                rendererRef.current.dispose();
                rendererRef.current = null;
            }
        };
    }, [initCanvas, handleWheel]);

    // Re-render when fractal type changes (reset viewport)
    useEffect(() => {
        const config = FRACTAL_CONFIGS[fractalType];
        viewportRef.current = createArbitraryCoordinate(
            config.defaultCenter.real,
            config.defaultCenter.imag,
            config.defaultZoom
        );
        scheduleRender();
    }, [fractalType, scheduleRender]);

    // Re-render when other params change
    useEffect(() => {
        scheduleRender();
    }, [paletteId, maxIterations, juliaReal, juliaImag, scheduleRender]);

    const containerStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
        touchAction: 'none'
    };

    const canvasStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block'
    };

    return (
        <div
            ref={containerRef}
            style={containerStyle}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <canvas ref={gpuCanvasRef} style={canvasStyle} />
            <canvas ref={cpuCanvasRef} style={{ ...canvasStyle, display: 'none' }} />
            <ZoomIndicator
                zoom={zoomLevel}
                renderMode={renderMode}
                renderProgress={renderProgress}
                precisionMode={precisionMode}
            />
        </div>
    );
};
