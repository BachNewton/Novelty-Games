import { useEffect, useRef, useCallback } from 'react';
import { FractalType, FRACTAL_CONFIGS } from '../data/FractalTypes';
import { WebGLRenderer } from '../logic/WebGLRenderer';

interface FractalCanvasProps {
    fractalType: FractalType;
    paletteId: string;
    maxIterations: number;
    juliaReal?: number;
    juliaImag?: number;
}

interface ViewportState {
    centerReal: number;
    centerImag: number;
    zoom: number;
}

export const FractalCanvas: React.FC<FractalCanvasProps> = ({
    fractalType,
    paletteId,
    maxIterations,
    juliaReal,
    juliaImag
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<WebGLRenderer | null>(null);
    const viewportRef = useRef<ViewportState | null>(null);
    const isDraggingRef = useRef(false);
    const lastMousePosRef = useRef({ x: 0, y: 0 });
    const lastTouchDistanceRef = useRef(0);
    const animationFrameRef = useRef<number | null>(null);

    // Store props in ref for use in callbacks
    const propsRef = useRef({ fractalType, paletteId, maxIterations, juliaReal, juliaImag });
    propsRef.current = { fractalType, paletteId, maxIterations, juliaReal, juliaImag };

    // Render the fractal
    const render = useCallback(() => {
        if (!rendererRef.current || !viewportRef.current) return;

        const props = propsRef.current;
        const config = FRACTAL_CONFIGS[props.fractalType];

        rendererRef.current.render({
            centerReal: viewportRef.current.centerReal,
            centerImag: viewportRef.current.centerImag,
            zoom: viewportRef.current.zoom,
            maxIterations: props.maxIterations,
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

    // Initialize canvas and WebGL renderer
    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);

        // Initialize or resize renderer
        if (!rendererRef.current) {
            try {
                rendererRef.current = new WebGLRenderer(canvas);
            } catch (e) {
                console.error('Failed to initialize WebGL:', e);
                return;
            }
        }

        rendererRef.current.resize(width, height);

        // Initialize viewport if needed
        const props = propsRef.current;
        const config = FRACTAL_CONFIGS[props.fractalType];

        if (!viewportRef.current) {
            viewportRef.current = {
                centerReal: config.defaultCenter.real,
                centerImag: config.defaultCenter.imag,
                zoom: config.defaultZoom
            };
        }

        render();
    }, [render]);

    // Pan the viewport
    const pan = useCallback((deltaX: number, deltaY: number) => {
        if (!viewportRef.current) return;

        viewportRef.current = {
            ...viewportRef.current,
            centerReal: viewportRef.current.centerReal - deltaX / viewportRef.current.zoom,
            // Flip Y because WebGL Y is inverted
            centerImag: viewportRef.current.centerImag + deltaY / viewportRef.current.zoom
        };

        scheduleRender();
    }, [scheduleRender]);

    // Zoom the viewport
    const zoom = useCallback((factor: number, screenX: number, screenY: number) => {
        if (!viewportRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        // Get position in canvas coordinates
        const canvasX = screenX - rect.left;
        const canvasY = screenY - rect.top;

        // Convert to complex plane coordinates before zoom
        const complexX = viewportRef.current.centerReal + (canvasX - rect.width / 2) / viewportRef.current.zoom;
        const complexY = viewportRef.current.centerImag - (canvasY - rect.height / 2) / viewportRef.current.zoom;

        // Apply zoom
        const newZoom = Math.max(10, Math.min(viewportRef.current.zoom * factor, 1e14));

        // Adjust center to keep point under cursor stationary
        const newCenterReal = complexX - (canvasX - rect.width / 2) / newZoom;
        const newCenterImag = complexY + (canvasY - rect.height / 2) / newZoom;

        viewportRef.current = {
            centerReal: newCenterReal,
            centerImag: newCenterImag,
            zoom: newZoom
        };

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

        // Add wheel listener with passive: false
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (canvas) {
                canvas.removeEventListener('wheel', handleWheel);
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
        viewportRef.current = {
            centerReal: config.defaultCenter.real,
            centerImag: config.defaultCenter.imag,
            zoom: config.defaultZoom
        };
        scheduleRender();
    }, [fractalType, scheduleRender]);

    // Re-render when other params change
    useEffect(() => {
        scheduleRender();
    }, [paletteId, maxIterations, juliaReal, juliaImag, scheduleRender]);

    const canvasStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        display: 'block',
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
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
