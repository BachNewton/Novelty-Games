import { useRef, useEffect, MutableRefObject } from 'react';
import { PrimeFinderData } from '../data/MessageTypes';

interface PrimeCanvasProps {
    dataRef: MutableRefObject<PrimeFinderData>;
    isRunning: boolean;
}

const PrimeCanvas: React.FC<PrimeCanvasProps> = ({ dataRef, isRunning }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };

        const formatNumber = (n: number): string => {
            return n.toLocaleString();
        };

        const formatTime = (ms: number): string => {
            const seconds = Math.floor(ms / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);

            const pad = (n: number) => n.toString().padStart(2, '0');

            if (hours > 0) {
                return `${pad(hours)}:${pad(minutes % 60)}:${pad(seconds % 60)}`;
            }
            return `${pad(minutes)}:${pad(seconds % 60)}`;
        };

        const formatRate = (n: number): string => {
            if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
            if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
            return n.toString();
        };

        const draw = () => {
            const width = canvas.width / window.devicePixelRatio;
            const height = canvas.height / window.devicePixelRatio;
            const data = dataRef.current;

            // Clear canvas
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, width, height);

            // Responsive scaling based on canvas dimensions
            const BASE_DESKTOP_WIDTH = 800;
            const BASE_DESKTOP_HEIGHT = 600;
            // Scale based on width, but also cap by height to prevent overflow on ultrawide screens
            const widthScale = width / BASE_DESKTOP_WIDTH;
            const heightScale = height / BASE_DESKTOP_HEIGHT;
            const scaleFactor = Math.max(0.5, Math.min(1.5, widthScale, heightScale));

            const scale = (baseValue: number, min?: number): number => {
                const scaled = baseValue * scaleFactor;
                return min !== undefined ? Math.max(min, scaled) : scaled;
            };

            const padding = scale(30, 15);
            const centerX = width / 2;

            // Calculate elapsed time
            const elapsed = isRunning && data.startTime > 0
                ? performance.now() - data.startTime
                : data.pausedElapsedTime;

            // Title
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = `${scale(16, 10)}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText('LATEST PRIME FOUND', centerX, padding + scale(20, 12));

            // Large prime number display
            ctx.fillStyle = '#00ff88';
            ctx.font = `bold ${scale(64, 28)}px monospace`;
            ctx.textAlign = 'center';
            const primeText = data.latestPrime > 0 ? formatNumber(data.latestPrime) : '---';
            ctx.fillText(primeText, centerX, padding + scale(90, 50));

            // Divider line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding, padding + scale(120, 70));
            ctx.lineTo(width - padding, padding + scale(120, 70));
            ctx.stroke();

            // Statistics section
            const statsY = padding + scale(160, 90);
            ctx.font = `${scale(14, 10)}px monospace`;
            ctx.textAlign = 'left';

            // Left column
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText('Total Primes:', padding, statsY);
            ctx.fillStyle = '#4fc3f7';
            ctx.fillText(formatNumber(data.totalPrimesFound), padding + scale(120, 80), statsY);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText('Highest Checked:', padding, statsY + scale(25, 16));
            ctx.fillStyle = '#4fc3f7';
            ctx.fillText(formatNumber(data.highestNumberChecked), padding + scale(140, 90), statsY + scale(25, 16));

            // Right column
            const rightCol = width / 2 + scale(20, 10);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText('Rate:', rightCol, statsY);
            ctx.fillStyle = '#4fc3f7';
            ctx.fillText(formatRate(data.primesPerSecond) + '/s', rightCol + scale(50, 35), statsY);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText('Time:', rightCol, statsY + scale(25, 16));
            ctx.fillStyle = '#4fc3f7';
            ctx.fillText(formatTime(elapsed), rightCol + scale(50, 35), statsY + scale(25, 16));

            // Divider line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.moveTo(padding, statsY + scale(50, 32));
            ctx.lineTo(width - padding, statsY + scale(50, 32));
            ctx.stroke();

            // Worker activity section
            const workersY = statsY + scale(80, 50);
            const workerStates = data.workerStates;
            const workerCount = workerStates.length;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = `${scale(14, 10)}px monospace`;
            ctx.textAlign = 'left';
            ctx.fillText(`Workers (${workerCount} threads)`, padding, workersY);

            // Draw worker bars - dynamically sized to fit available space
            const bottomMargin = scale(40, 25);
            const barStartY = workersY + scale(20, 12);
            const availableHeight = height - barStartY - bottomMargin - scale(10, 5);

            // Calculate bar dimensions to fit all workers
            const idealBarHeight = scale(20, 12);
            const idealBarGap = scale(8, 4);
            const idealTotalPerWorker = idealBarHeight + idealBarGap;

            // If workers would overflow, shrink to fit
            const totalNeeded = workerCount * idealTotalPerWorker;
            const shrinkFactor = totalNeeded > availableHeight ? availableHeight / totalNeeded : 1;
            const barHeight = Math.max(8, idealBarHeight * shrinkFactor);
            const barGap = Math.max(2, idealBarGap * shrinkFactor);

            const labelWidth = scale(40, 25);
            const rateColumnWidth = scale(80, 50);
            const barWidth = width - padding * 2 - labelWidth - rateColumnWidth;

            for (let i = 0; i < workerCount; i++) {
                const worker = workerStates[i];
                const y = barStartY + i * (barHeight + barGap);

                // Worker label
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.font = `${Math.max(8, scale(12, 8) * shrinkFactor)}px monospace`;
                ctx.textAlign = 'left';
                ctx.fillText(`W${i}`, padding, y + barHeight * 0.7);

                // Progress bar background
                const barX = padding + labelWidth;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(barX, y, barWidth, barHeight);

                // Progress bar fill
                if (worker.status === 'working') {
                    const fillWidth = barWidth * worker.progress;
                    ctx.fillStyle = 'rgba(76, 175, 80, 0.6)';
                    ctx.fillRect(barX, y, fillWidth, barHeight);
                }

                // Rate
                ctx.fillStyle = '#4fc3f7';
                ctx.font = `${Math.max(8, scale(12, 8) * shrinkFactor)}px monospace`;
                ctx.textAlign = 'right';
                ctx.fillText(formatRate(worker.numbersPerSecond) + '/s', width - padding, y + barHeight * 0.7);
            }

            // Status indicator
            if (!isRunning && data.latestPrime === 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.font = `${scale(18, 12)}px monospace`;
                ctx.textAlign = 'center';
                ctx.fillText('Press Start to begin', centerX, height - bottomMargin);
            } else if (!isRunning) {
                ctx.fillStyle = 'rgba(255, 200, 100, 0.6)';
                ctx.font = `${scale(14, 10)}px monospace`;
                ctx.textAlign = 'center';
                ctx.fillText('Paused', centerX, height - bottomMargin);
            }

            // Schedule next frame
            animationFrameRef.current = requestAnimationFrame(draw);
        };

        // Set up resize observer
        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(canvas);

        // Initial size
        resizeCanvas();

        // Start animation loop
        animationFrameRef.current = requestAnimationFrame(draw);

        return () => {
            resizeObserver.disconnect();
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [dataRef, isRunning]);

    const canvasStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        display: 'block'
    };

    return <canvas ref={canvasRef} style={canvasStyle} />;
};

export default PrimeCanvas;
