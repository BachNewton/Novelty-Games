import { useEffect, useRef } from "react";
import { randomNum } from "../../util/Randomizer";
import { Box, Position, Ring } from "../data/Data";
import { collision } from "../logic/Collisions";
import { coerceToRange } from "../../util/Math";

interface CarnivalProps {
    goHome: () => void;
}

const GAME_OVER_TIME = 8000;
const PERFECT_BONUS_TIME = 1000;
const PERFECT_SPEED = 0.6;

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

        initCanvas(canvas, ctx, goHome);
    }, []);

    return <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <canvas ref={canvasRef} />
    </div>;
};

function initCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, goHome: () => void) {
    let level = 0;
    let noMisses = true;
    let finalTime: string | null = null;
    const boxes = [createBox(level)];
    const rings = new Array<Ring>();
    let startTime = performance.now();
    let perfectTime: number | null = null;

    canvas.ontouchstart = e => {
        if (e.touches.length >= 3) {
            level = 0;
            noMisses = true;
            finalTime = null;
            boxes.splice(0, boxes.length, createBox(level));
            rings.splice(0, rings.length);
            startTime = performance.now();
            perfectTime = null;
        }
    };

    canvas.onclick = e => {
        if (finalTime !== null) return;

        handleClick(e, canvas, level, boxes, rings, noMisses, () => {
            level++;

            if (noMisses) {
                if (perfectTime === null || perfectTime < performance.now()) {
                    perfectTime = performance.now() + PERFECT_BONUS_TIME;
                } else {
                    perfectTime += PERFECT_BONUS_TIME;
                }
            }

            if (level >= 6) {
                finalTime = getStopwatch(startTime);
                setTimeout(() => {
                    hasCanvasContextBeenSet = false;
                    goHome();
                }, GAME_OVER_TIME);
            } else {
                boxes.push(createBox(level));
            }

            noMisses = true;
        }, () => {
            noMisses = false;
        });
    };

    let previousTime = performance.now();
    const animate: FrameRequestCallback = (timeNow: DOMHighResTimeStamp) => {
        const deltaTime = timeNow - previousTime;
        previousTime = timeNow;

        draw(canvas, ctx, boxes, rings, startTime, finalTime, perfectTime);
        drawDebug(canvas, ctx, deltaTime);
        update(deltaTime, canvas, boxes, rings, perfectTime);

        requestAnimationFrame(animate);
    };
    animate(previousTime);
}

function drawDebug(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, deltaTime: number) {
    ctx.fillStyle = 'grey';
    ctx.font = `${getFontSize(canvas) / 3}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`FPS: ${(1000 / deltaTime).toFixed(0)}`, 0, 0);
}

function draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, boxes: Box[], rings: Ring[], startTime: number, finalTime: string | null, perfectTime: number | null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (perfectTime !== null && perfectTime >= performance.now()) {
        ctx.fillStyle = 'grey';
        ctx.beginPath();
        const remainingTimePercentage = (performance.now() - perfectTime) / PERFECT_BONUS_TIME;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle - 2 * Math.PI * remainingTimePercentage;
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 4, startAngle, endAngle);
        ctx.lineTo(canvas.width / 2, canvas.height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'gold';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = 'white';
        ctx.font = `${getFontSize(canvas) / 2}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('YOU ARE', canvas.width / 2, 0.25 * canvas.height);
        ctx.fillText('IN THE ZONE', canvas.width / 2, 0.75 * canvas.height);
    }

    if (finalTime === null) {
        drawTime(canvas, ctx, startTime, finalTime);
    }

    for (const ring of rings) {
        ctx.beginPath();
        ctx.arc(ring.pos.x, ring.pos.y, ring.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.strokeStyle = 'grey';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    for (const box of boxes) {
        ctx.fillStyle = box.color;
        const x = box.pos.x * canvas.width;
        const y = box.pos.y * canvas.height;
        const width = box.width * canvas.width;
        const height = box.height * canvas.height;
        ctx.fillRect(x, y, width, height);

        if (box.isPerfect !== null) {
            ctx.strokeStyle = box.isPerfect ? 'white' : 'black';
            ctx.lineWidth = 7;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + width, y + height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + width, y);
            ctx.lineTo(x, y + height);
            ctx.stroke();
        }

        if (box.hitColor !== null) {
            ctx.strokeStyle = box.hitColor;
            ctx.lineWidth = 7;
            ctx.strokeRect(x, y, width, height);
        }
    }

    if (finalTime !== null) {
        drawTime(canvas, ctx, startTime, finalTime);
    }
}

function drawTime(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, startTime: number, finalTime: string | null) {
    const text = finalTime === null ? getStopwatch(startTime) : `Game Over: ${finalTime}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.font = `${getFontSize(canvas)}px sans-serif`;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function update(deltaTime: number, canvas: HTMLCanvasElement, boxes: Box[], rings: Ring[], perfectTime: number | null) {
    for (const ring of rings) {
        ring.radius += 0.00085 * deltaTime * canvas.height;
    }

    for (let i = rings.length - 1; i >= 0; i--) {
        if (rings[i].radius > canvas.width && rings[i].radius > canvas.height) {
            rings.splice(i, 1);
        }
    }

    for (const box of boxes) {
        box.previousPos.x = box.pos.x;
        box.previousPos.y = box.pos.y;

        const speedScale = perfectTime !== null && perfectTime >= performance.now() ? PERFECT_SPEED : 1;

        box.pos.x += speedScale * box.speed * Math.cos(box.angle) * deltaTime;
        box.pos.x = coerceToRange(box.pos.x, 0, 1 - box.width);

        box.pos.y += speedScale * box.speed * Math.sin(box.angle) * deltaTime;
        box.pos.y = coerceToRange(box.pos.y, 0, 1 - box.height);

        box.angle += randomNum(-0.06, 0.06) * deltaTime;
    }
}

function handleClick(e: MouseEvent, canvas: HTMLCanvasElement, level: number, boxes: Box[], rings: Ring[], noMisses: boolean, onHit: () => void, onMiss: () => void) {
    const mouseX = e.pageX;
    const mouseY = e.pageY;

    rings.push({
        pos: {
            x: mouseX,
            y: mouseY,
        },
        radius: 10
    });

    const targetBox = boxes[level];

    const hit = collision({ x: mouseX / canvas.width, y: mouseY / canvas.height }, targetBox);
    const hitPreviousPos = collision({ x: mouseX / canvas.width, y: mouseY / canvas.height }, targetBox, true);
    if (hit || hitPreviousPos) {
        targetBox.hitColor = hit ? 'white' : 'gold';
        targetBox.isPerfect = noMisses ? true : false;
        onHit();
    } else {
        onMiss();
    }
}

function getFontSize(canvas: HTMLCanvasElement): number {
    return canvas.height * 0.06;
}

function getStopwatch(startTime: number): string {
    const time = ((performance.now() - startTime) / 1000).toFixed(1);
    return `${time}`;
}

function createBox(level: number): Box {
    const size = getSize(level);
    const width = (16 / 8) * size;
    const height = 1 * size;

    const pos: Position = {
        x: randomNum(0, 1 - width),
        y: randomNum(0, 1 - height)
    };

    return {
        pos: pos,
        previousPos: { x: pos.x, y: pos.y },
        width: width,
        height: height,
        angle: 0.25 * Math.PI,
        color: getColor(level),
        speed: getSpeed(level),
        hitColor: null,
        isPerfect: null
    };
}

function getSize(level: number): number {
    switch (level) {
        case 0:
            return 0.1;
        case 1:
            return 0.09;
        case 2:
            return 0.08;
        case 3:
            return 0.065;
        case 4:
            return 0.045;
        case 5:
            return 0.04;
        default:
            throw new Error();
    }
}

function getSpeed(level: number): number {
    switch (level) {
        case 0:
            return 0.0004;
        case 1:
            return 0.0005;
        case 2:
            return 0.0006;
        case 3:
            return 0.0007;
        case 4:
            return 0.0008;
        case 5:
            return 0.0009;
        default:
            throw new Error();
    }
}

function getColor(level: number): string {
    switch (level) {
        case 0:
            return 'purple';
        case 1:
            return 'blue';
        case 2:
            return 'green';
        case 3:
            return 'orange';
        case 4:
            return 'red';
        case 5:
            return 'black'
        default:
            throw new Error();
    }
}

export default Carnival;
