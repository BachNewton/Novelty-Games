import { useEffect, useRef } from "react";

interface CanvasProps {
    width: number;
    height: number;
    draw: (ctx: CanvasRenderingContext2D) => void;
}

const Canvas: React.FC<CanvasProps> = ({ width, height, draw }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas === null) return;
        const ctx = canvas.getContext('2d');
        if (ctx === null) return;

        canvas.width = width;
        canvas.height = height;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const cleanupCanvas = initCanvas(canvas, ctx, () => draw(ctx));

        return cleanupCanvas;
    }, [height, width])

    return <canvas ref={canvasRef} />;
};

function initCanvas(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    draw: () => void
): () => void {
    let animationFrameId: number;

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        draw();

        animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);


    return () => cancelAnimationFrame(animationFrameId);
}

export default Canvas;
