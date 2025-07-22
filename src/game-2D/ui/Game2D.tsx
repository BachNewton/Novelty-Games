import { useEffect, useRef } from "react";
import { GameWorld } from "../worlds/GameWorld";
import { CarnivalWorld } from "../worlds/carnival/CarnivalWorld";
import { WigglerWorld } from "../worlds/wigglers/WigglerWorld";
import { GameWorldType } from "../worlds/GameWorldType";
import { createCatWorld } from "../worlds/cat/CatWorld";
import { createPlatformerWorld } from "../worlds/platformer/PlatformerWorld";
import { createDrawer } from "../worlds/Drawer";
import { createCamera } from "../worlds/Camera";
import { createKeyboardInput } from "../../util/input/Keyboard";

interface Game2DProps {
    goHome: () => void;
    gameWorldType: GameWorldType;
}

const Game2D: React.FC<Game2DProps> = ({ goHome, gameWorldType }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas === null) return;
        const ctx = canvas.getContext('2d');
        if (ctx === null) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            ctx.imageSmoothingEnabled = false;
        };

        resizeCanvas();

        window.addEventListener('resize', resizeCanvas);

        const gameWorld = createGameWorld(gameWorldType, canvas, ctx, goHome);

        const cleanupAnimation = initCanvas(canvas, ctx, gameWorld);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cleanupAnimation();
        };
    }, []);

    return <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden' }}>
        <canvas ref={canvasRef} />
    </div>;
};

function createGameWorld(gameWorldType: GameWorldType, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, goHome: () => void): GameWorld {
    switch (gameWorldType) {
        case GameWorldType.CARNIVAL:
            return new CarnivalWorld(canvas, ctx, goHome);
        case GameWorldType.WIGGLERS:
            return new WigglerWorld(canvas, ctx);
        case GameWorldType.CAT:
            return createCatWorld(canvas, ctx);
        case GameWorldType.PLATFORMER:
            const camera = createCamera(ctx);
            return createPlatformerWorld(
                createDrawer(ctx, camera),
                camera,
                createKeyboardInput()
            );
        default:
            throw new Error(`GameWorldType not supported: ${gameWorldType}`);
    }
}

function initCanvas(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    gameWorld: GameWorld
): () => void {
    canvas.ontouchstart = e => {
        gameWorld.touchEvents?.onTouchStart?.(e);
    };

    canvas.ontouchmove = e => {
        e.preventDefault(); // Don't refresh the page when pulling down
        gameWorld.touchEvents?.onTouchMove?.(e);
    };

    canvas.ontouchend = e => {
        gameWorld.touchEvents?.onTouchEnd?.(e);
    };

    canvas.onmousedown = e => {
        gameWorld.mouseEvents?.onMouseDown?.(e.pageX / canvas.width, e.pageY / canvas.height);
    };

    canvas.onmousemove = e => {
        gameWorld.mouseEvents?.onMouseMove?.(e.pageX / canvas.width, e.pageY / canvas.height);
    };

    canvas.onmouseup = e => {
        gameWorld.mouseEvents?.onMouseUp?.(e.pageX / canvas.width, e.pageY / canvas.height);
    };

    canvas.onclick = e => {
        gameWorld.mouseEvents?.onClick?.(e);
    };

    let previousTime = performance.now();
    let animationFrameId: number;

    const animate: FrameRequestCallback = (timeNow: DOMHighResTimeStamp) => {
        const deltaTime = timeNow - previousTime;
        previousTime = timeNow;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        gameWorld.draw();

        drawDebug(canvas, ctx, deltaTime);

        gameWorld.update(deltaTime);

        animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
        cancelAnimationFrame(animationFrameId);
    };
}

function drawDebug(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, deltaTime: number) {
    ctx.fillStyle = 'grey';
    const fontSize = canvas.height * 0.02;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`FPS: ${(1000 / deltaTime).toFixed(0)}`, 0, 0);
}

export default Game2D;
