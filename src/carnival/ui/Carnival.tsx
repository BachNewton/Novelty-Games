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

const Carnival: React.FC<CarnivalProps> = ({ goHome }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    let level = 0;
    let startTime = Date.now();
    const boxes = [createBox(level)];

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas === null) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const box = boxes[level];

        if (mouseX >= box.x && mouseX <= box.x + box.width * canvas.height * SIZE_TARGET && mouseY >= box.y && mouseY <= box.y + box.height * canvas.height * SIZE_TARGET) {
            level++;

            if (level >= 6) {
                alert(`You win!\n${getTime(startTime)}\nHi Nick! 😜`);
                goHome();
            } else {
                boxes.push(createBox(level));
            }
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas === null) return;
        const ctx = canvas.getContext('2d');
        if (ctx === null) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);

        let previousTime = performance.now();

        const animate = (timeNow: number) => {
            const deltaTime = timeNow - previousTime;
            previousTime = timeNow;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'white';
            ctx.font = `${getFontSize(canvas)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(getTime(startTime), canvas.width / 2, canvas.height / 2);

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

            requestAnimationFrame(animate);
        };

        resizeCanvas();
        animate(previousTime);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return <div style={{ display: 'flex', height: '100vh' }}>
        <canvas ref={canvasRef} onClick={handleCanvasClick} />
    </div>;
};

function getFontSize(canvas: HTMLCanvasElement): number {
    return canvas.height * FONT_TARGET;
}

function getTime(startTime: number): string {
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
