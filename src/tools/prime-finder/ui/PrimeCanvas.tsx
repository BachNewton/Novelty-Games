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

            const padding = 30;
            const centerX = width / 2;

            // Calculate elapsed time
            const elapsed = isRunning && data.startTime > 0
                ? performance.now() - data.startTime
                : 0;

            // Title
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '16px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('LATEST PRIME FOUND', centerX, padding + 20);

            // Large prime number display
            ctx.fillStyle = '#00ff88';
            ctx.font = 'bold 64px monospace';
            ctx.textAlign = 'center';
            const primeText = data.latestPrime > 0 ? formatNumber(data.latestPrime) : '---';
            ctx.fillText(primeText, centerX, padding + 90);

            // Divider line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding, padding + 120);
            ctx.lineTo(width - padding, padding + 120);
            ctx.stroke();

            // Statistics section
            const statsY = padding + 160;
            ctx.font = '14px monospace';
            ctx.textAlign = 'left';

            // Left column
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText('Total Primes:', padding, statsY);
            ctx.fillStyle = '#4fc3f7';
            ctx.fillText(formatNumber(data.totalPrimesFound), padding + 120, statsY);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText('Highest Checked:', padding, statsY + 25);
            ctx.fillStyle = '#4fc3f7';
            ctx.fillText(formatNumber(data.highestNumberChecked), padding + 140, statsY + 25);

            // Right column
            const rightCol = width / 2 + 20;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText('Rate:', rightCol, statsY);
            ctx.fillStyle = '#4fc3f7';
            ctx.fillText(formatRate(data.primesPerSecond) + '/s', rightCol + 50, statsY);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText('Time:', rightCol, statsY + 25);
            ctx.fillStyle = '#4fc3f7';
            ctx.fillText(formatTime(elapsed), rightCol + 50, statsY + 25);

            // Divider line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.moveTo(padding, statsY + 50);
            ctx.lineTo(width - padding, statsY + 50);
            ctx.stroke();

            // Worker activity section
            const workersY = statsY + 80;
            const workerStates = data.workerStates;
            const workerCount = workerStates.length;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '14px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`Workers (${workerCount} threads)`, padding, workersY);

            // Draw worker bars
            const barStartY = workersY + 20;
            const barHeight = 20;
            const barGap = 8;
            const barWidth = width - padding * 2 - 120;
            const labelWidth = 40;

            for (let i = 0; i < workerCount; i++) {
                const worker = workerStates[i];
                const y = barStartY + i * (barHeight + barGap);

                // Worker label
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.font = '12px monospace';
                ctx.textAlign = 'left';
                ctx.fillText(`W${i}`, padding, y + 14);

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
                ctx.textAlign = 'right';
                ctx.fillText(formatRate(worker.numbersPerSecond) + '/s', width - padding, y + 14);
            }

            // Status indicator
            if (!isRunning && data.latestPrime === 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.font = '18px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Press Start to begin', centerX, height - 40);
            } else if (!isRunning) {
                ctx.fillStyle = 'rgba(255, 200, 100, 0.6)';
                ctx.font = '14px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Stopped', centerX, height - 40);
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
