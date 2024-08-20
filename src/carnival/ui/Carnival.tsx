import { useEffect, useRef } from "react";

interface CarnivalProps {
    goHome: () => void;
}

const SPEED_TARGET = 0.0002;
const FONT_TARGET = 0.06;
const SIZE_TARGET = 0.001;

interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
    angle: number;
    color: string;
    speed: number;
};

interface Ring {
    x: number;
    y: number;
    radius: number;
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
            canvas.width = window.visualViewport?.width || window.innerWidth;
            canvas.height = window.visualViewport?.height || window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        initCanvas(canvas, ctx, goHome);
    }, []);

    return <div style={{ display: 'flex', height: '100vh' }}>
        <canvas ref={canvasRef} />
    </div>;
};

function initCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, goHome: () => void) {
    let level = 0;
    const boxes = [createBox(level)];
    const rings = new Array<Ring>();
    const startTime = Date.now();

    canvas.onclick = e => {
        handleClick(e, canvas, level, boxes, rings, () => {
            level++;

            if (level >= 6) {
                alert(`You win!\n${getStopwatch(startTime)}\nHi Nick! 😜`);
                hasCanvasContextBeenSet = false;
                goHome();
            } else {
                boxes.push(createBox(level));
            }
        });
    };

    let previousTime = performance.now();
    const animate: FrameRequestCallback = (timeNow: DOMHighResTimeStamp) => {
        const deltaTime = timeNow - previousTime;
        previousTime = timeNow;

        draw(deltaTime, canvas, ctx, boxes, rings, startTime);
        update(deltaTime, canvas, boxes, rings);

        requestAnimationFrame(animate);
    };
    animate(previousTime);
}

function draw(deltaTime: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, boxes: Box[], rings: Ring[], startTime: number) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = `${getFontSize(canvas)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(getStopwatch(startTime), canvas.width / 2, canvas.height / 2);

    for (const ring of rings) {
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.strokeStyle = 'grey';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    for (const box of boxes) {
        ctx.fillStyle = box.color;
        const width = box.width * canvas.height * SIZE_TARGET;
        const height = box.height * canvas.height * SIZE_TARGET;
        ctx.fillRect(box.x, box.y, width, height);

        box.x += SPEED_TARGET * deltaTime * canvas.height * box.speed * Math.cos(box.angle);
        box.x = Math.min(box.x, canvas.width - box.width * canvas.height * SIZE_TARGET);
        box.x = Math.max(box.x, 0);
        box.y += SPEED_TARGET * deltaTime * canvas.height * box.speed * Math.sin(box.angle);
        box.y = Math.min(box.y, canvas.height - box.height * canvas.height * SIZE_TARGET);
        box.y = Math.max(box.y, 0);
        box.angle += 0.5 * Math.random() - 0.25;
    }
}

function update(deltaTime: number, canvas: HTMLCanvasElement, boxes: Box[], rings: Ring[]) {
    for (const ring of rings) {
        ring.radius += 0.00085 * deltaTime * canvas.height;
    }

    for (let i = rings.length - 1; i >= 0; i--) {
        if (rings[i].radius > canvas.width && rings[i].radius > canvas.height) {
            rings.splice(i, 1);
        }
    }

    for (const box of boxes) {
        box.x += SPEED_TARGET * deltaTime * canvas.height * box.speed * Math.cos(box.angle);
        box.x = Math.min(box.x, canvas.width - box.width * canvas.height * SIZE_TARGET);
        box.x = Math.max(box.x, 0);
        box.y += SPEED_TARGET * deltaTime * canvas.height * box.speed * Math.sin(box.angle);
        box.y = Math.min(box.y, canvas.height - box.height * canvas.height * SIZE_TARGET);
        box.y = Math.max(box.y, 0);
        box.angle += 0.5 * Math.random() - 0.25;
    }
}

function handleClick(e: MouseEvent, canvas: HTMLCanvasElement, level: number, boxes: Box[], rings: Ring[], onHit: () => void) {
    const mouseX = e.pageX;
    const mouseY = e.pageY;

    rings.push({
        x: mouseX,
        y: mouseY,
        radius: 10
    });

    const targetBox = boxes[level];
    const width = targetBox.width * canvas.height * SIZE_TARGET;
    const height = targetBox.height * canvas.height * SIZE_TARGET;

    if (mouseX >= targetBox.x && mouseX <= targetBox.x + width && mouseY >= targetBox.y && mouseY <= targetBox.y + height) {
        onHit();
    }
}

function getFontSize(canvas: HTMLCanvasElement): number {
    return canvas.height * FONT_TARGET;
}

function getStopwatch(startTime: number): string {
    const time = ((Date.now() - startTime) / 1000).toFixed(1);
    return `${time}`;
}

function createBox(level: number): Box {
    return {
        x: 0,
        y: 0,
        width: getSize(level),
        height: getSize(level),
        angle: 0.25 * Math.PI,
        color: getColor(level),
        speed: getSpeed(level)
    };
}

function getSize(level: number): number {
    switch (level) {
        case 0:
            return 100;
        case 1:
            return 90;
        case 2:
            return 80;
        case 3:
            return 65;
        case 4:
            return 45;
        case 5:
            return 40;
        default:
            throw new Error();
    }
}

function getSpeed(level: number): number {
    switch (level) {
        case 0:
            return 1;
        case 1:
            return 1.1;
        case 2:
            return 1.2;
        case 3:
            return 1.3;
        case 4:
            return 1.5;
        case 5:
            return 1.7;
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
