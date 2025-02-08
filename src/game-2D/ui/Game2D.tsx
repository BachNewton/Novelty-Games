import { useEffect, useRef } from "react";
import { GameWorld } from "../worlds/GameWorld";
import { CarnivalWorld } from "../worlds/carnival/CarnivalWorld";
import { WigglerWorld } from "../worlds/wigglers/WigglerWorld";
import { GameWorldType } from "../worlds/GameWorldType";
import { createCatWorld } from "../worlds/cat/CatWorld";

interface Game2DProps {
    goHome: () => void;
    gameWorldType: GameWorldType;
}

let hasCanvasContextBeenSet = false;

const Game2D: React.FC<Game2DProps> = ({ goHome, gameWorldType }) => {
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

        const gameWorld = createGameWorld(gameWorldType, canvas, ctx, goHome);

        initCanvas(canvas, ctx, gameWorld);
    }, []);

    return <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <canvas ref={canvasRef} />
    </div>;
};

function createGameWorld(gameWorldType: GameWorldType, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, goHome: () => void): GameWorld {
    switch (gameWorldType) {
        case GameWorldType.CARNIVAL:
            return new CarnivalWorld(canvas, ctx, () => {
                hasCanvasContextBeenSet = false;
                goHome();
            });
        case GameWorldType.WIGGLERS:
            return new WigglerWorld(canvas, ctx);
        case GameWorldType.CAT:
            return createCatWorld(canvas, ctx);
        default:
            throw new Error(`GameWorldType not supported: ${gameWorldType}`);
    }
}

function initCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, gameWorld: GameWorld) {
    canvas.ontouchstart = e => {
        gameWorld.onTouchStart(e);
    };

    canvas.ontouchmove = e => {
        e.preventDefault(); // Don't refresh the page when pulling down
        gameWorld.onTouchMove(e);
    };

    canvas.ontouchend = e => {
        gameWorld.onTouchEnd(e);
    };

    canvas.onmousedown = e => {
        gameWorld.onMouseDown(e.pageX / canvas.width, e.pageY / canvas.height);
    };

    canvas.onmousemove = e => {
        gameWorld.onMouseMove(e.pageX / canvas.width, e.pageY / canvas.height);
    };

    canvas.onmouseup = e => {
        gameWorld.onMouseUp(e.pageX / canvas.width, e.pageY / canvas.height);
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

export default Game2D;
