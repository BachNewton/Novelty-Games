import { useEffect, useRef } from "react";
import { GameWorld } from "../worlds/GameWorld";
import { TouchBoxWorld } from "../worlds/touchBox/TouchBoxWorld";

interface CarnivalProps {
    goHome: () => void;
}

let hasCanvasContextBeenSet = false;

const Carnival: React.FC<CarnivalProps> = ({ goHome }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (hasCanvasContextBeenSet) return;
        hasCanvasContextBeenSet = true;

        const canvas = canvasRef.current;
        if (canvas === null) return;
        const ctx = canvas.getContext('2d');
        if (ctx === null) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();

        window.addEventListener('resize', resizeCanvas);

        const gameWorld: GameWorld = new TouchBoxWorld(canvas, ctx, () => {
            hasCanvasContextBeenSet = false;
            goHome();
        });

        initCanvas(canvas, ctx, gameWorld);
    }, []);

    return <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <canvas ref={canvasRef} />
    </div>;
};

function initCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, gameWorld: GameWorld) {
    canvas.ontouchstart = e => {
        gameWorld.onTouchStart(e);
    };

    canvas.onclick = e => {
        gameWorld.onClick(e);
    };

    let previousTime = performance.now();

    const animate: FrameRequestCallback = (timeNow: DOMHighResTimeStamp) => {
        const deltaTime = timeNow - previousTime;
        previousTime = timeNow;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        gameWorld.draw();

        drawDebug(canvas, ctx, deltaTime);

        gameWorld.update(deltaTime);

        requestAnimationFrame(animate);
    };

    animate(previousTime);
}

function drawDebug(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, deltaTime: number) {
    ctx.fillStyle = 'grey';
    const fontSize = canvas.height * 0.06;
    ctx.font = `${fontSize / 3}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`FPS: ${(1000 / deltaTime).toFixed(0)}`, 0, 0);
}

export default Carnival;
