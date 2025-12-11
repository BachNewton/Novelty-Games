import { useRef, useEffect, useCallback, MutableRefObject } from 'react';
import { numberToSpiralPosition, SpiralCoordinate } from '../logic/UlamSpiral';

interface UlamSpiralCanvasProps {
    primesRef: MutableRefObject<Set<number>>;
}

interface ViewState {
    offsetX: number;
    offsetY: number;
    zoom: number;
}

// Cache spiral positions to avoid recalculating
const positionCache = new Map<number, SpiralCoordinate>();

function getCachedPosition(n: number): SpiralCoordinate {
    let pos = positionCache.get(n);
    if (!pos) {
        pos = numberToSpiralPosition(n);
        positionCache.set(n, pos);
    }
    return pos;
}

const UlamSpiralCanvas: React.FC<UlamSpiralCanvasProps> = ({ primesRef }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const viewStateRef = useRef<ViewState>({ offsetX: 0, offsetY: 0, zoom: 8 });
    const isDraggingRef = useRef(false);
    const lastMousePosRef = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number | null>(null);
    const lastDrawnPrimeCountRef = useRef(0);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { offsetX, offsetY, zoom } = viewStateRef.current;
        const width = canvas.width / window.devicePixelRatio;
        const height = canvas.height / window.devicePixelRatio;
        const centerX = width / 2 + offsetX;
        const centerY = height / 2 + offsetY;

        // Clear canvas
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);

        // Calculate visible bounds in world coordinates
        const worldLeft = (-offsetX - width / 2) / zoom;
        const worldRight = (-offsetX + width / 2) / zoom;
        const worldTop = (offsetY + height / 2) / zoom;
        const worldBottom = (offsetY - height / 2) / zoom;

        // Draw subtle grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        const gridStep = Math.max(10, Math.floor(100 / zoom));

        const gridLeft = Math.floor(worldLeft / gridStep) * gridStep;
        const gridRight = Math.ceil(worldRight / gridStep) * gridStep;
        const gridBottom = Math.floor(worldBottom / gridStep) * gridStep;
        const gridTop = Math.ceil(worldTop / gridStep) * gridStep;

        for (let x = gridLeft; x <= gridRight; x += gridStep) {
            const screenX = centerX + x * zoom;
            ctx.beginPath();
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, height);
            ctx.stroke();
        }
        for (let y = gridBottom; y <= gridTop; y += gridStep) {
            const screenY = centerY - y * zoom;
            ctx.beginPath();
            ctx.moveTo(0, screenY);
            ctx.lineTo(width, screenY);
            ctx.stroke();
        }

        // Only draw primes (much faster than iterating all numbers)
        const dotSize = Math.max(2, zoom * 0.6);
        const primeSet = primesRef.current;

        // Batch draw primes - no shadow for performance
        ctx.fillStyle = '#00ff88';

        let visibleCount = 0;
        const margin = dotSize * 2;

        for (const prime of primeSet) {
            const pos = getCachedPosition(prime);

            // Quick bounds check in world coordinates first
            if (pos.x < worldLeft - 1 || pos.x > worldRight + 1 ||
                pos.y < worldBottom - 1 || pos.y > worldTop + 1) {
                continue;
            }

            const screenX = centerX + pos.x * zoom;
            const screenY = centerY - pos.y * zoom;

            // Screen bounds check
            if (screenX < -margin || screenX > width + margin ||
                screenY < -margin || screenY > height + margin) {
                continue;
            }

            ctx.beginPath();
            ctx.arc(screenX, screenY, dotSize, 0, Math.PI * 2);
            ctx.fill();
            visibleCount++;
        }

        // Draw center marker (1)
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(centerX, centerY, dotSize * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw info overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '12px monospace';
        ctx.fillText(`Zoom: ${zoom.toFixed(1)}x`, 10, 20);
        ctx.fillText(`Visible: ${visibleCount.toLocaleString()} primes`, 10, 36);
        ctx.fillText(`Total: ${primeSet.size.toLocaleString()} primes`, 10, 52);

        lastDrawnPrimeCountRef.current = primeSet.size;
    }, [primesRef]);

    const scheduleRedraw = useCallback(() => {
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(() => {
            draw();
            animationFrameRef.current = null;
        });
    }, [draw]);

    // Redraw periodically to show new primes
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (primesRef.current.size !== lastDrawnPrimeCountRef.current) {
                scheduleRedraw();
            }
        }, 100); // Update visualization at most 10 times per second

        return () => clearInterval(intervalId);
    }, [primesRef, scheduleRedraw]);

    // Initial draw
    useEffect(() => {
        scheduleRedraw();
    }, [scheduleRedraw]);

    // Handle canvas resize
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            }
            scheduleRedraw();
        };

        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(canvas);

        // Initial size
        resizeCanvas();

        return () => resizeObserver.disconnect();
    }, [scheduleRedraw]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDraggingRef.current = true;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDraggingRef.current) return;

        const dx = e.clientX - lastMousePosRef.current.x;
        const dy = e.clientY - lastMousePosRef.current.y;

        viewStateRef.current.offsetX += dx;
        viewStateRef.current.offsetY += dy;

        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        scheduleRedraw();
    }, [scheduleRedraw]);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
    }, []);

    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const oldZoom = viewStateRef.current.zoom;
        const newZoom = Math.max(0.5, Math.min(100, oldZoom * zoomFactor));

        // Adjust offset to zoom toward mouse position
        const width = canvas.width / window.devicePixelRatio;
        const height = canvas.height / window.devicePixelRatio;
        const centerX = width / 2;
        const centerY = height / 2;

        const worldX = (mouseX - centerX - viewStateRef.current.offsetX) / oldZoom;
        const worldY = (centerY + viewStateRef.current.offsetY - mouseY) / oldZoom;

        viewStateRef.current.zoom = newZoom;
        viewStateRef.current.offsetX = mouseX - centerX - worldX * newZoom;
        viewStateRef.current.offsetY = centerY - mouseY + worldY * newZoom;

        scheduleRedraw();
    }, [scheduleRedraw]);

    // Attach wheel listener with passive: false to allow preventDefault
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        return () => canvas.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    // Touch handling for mobile
    const touchStartRef = useRef<{ x: number; y: number; distance?: number } | null>(null);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            touchStartRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        } else if (e.touches.length === 2) {
            const dx = e.touches[1].clientX - e.touches[0].clientX;
            const dy = e.touches[1].clientY - e.touches[0].clientY;
            touchStartRef.current = {
                x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
                distance: Math.sqrt(dx * dx + dy * dy)
            };
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!touchStartRef.current) return;

        if (e.touches.length === 1 && !touchStartRef.current.distance) {
            const dx = e.touches[0].clientX - touchStartRef.current.x;
            const dy = e.touches[0].clientY - touchStartRef.current.y;

            viewStateRef.current.offsetX += dx;
            viewStateRef.current.offsetY += dy;

            touchStartRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            scheduleRedraw();
        } else if (e.touches.length === 2 && touchStartRef.current.distance) {
            const dx = e.touches[1].clientX - e.touches[0].clientX;
            const dy = e.touches[1].clientY - e.touches[0].clientY;
            const newDistance = Math.sqrt(dx * dx + dy * dy);

            const zoomFactor = newDistance / touchStartRef.current.distance;
            viewStateRef.current.zoom = Math.max(0.5, Math.min(100, viewStateRef.current.zoom * zoomFactor));

            touchStartRef.current.distance = newDistance;
            scheduleRedraw();
        }
    }, [scheduleRedraw]);

    const handleTouchEnd = useCallback(() => {
        touchStartRef.current = null;
    }, []);

    const canvasStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
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

export default UlamSpiralCanvas;
