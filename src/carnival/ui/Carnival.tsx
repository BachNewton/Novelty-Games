import { useEffect, useRef } from "react";

interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
};

const Carnival: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const boxWidth = 50;
    const boxHeight = 50;
    let x = 0;
    let y = 0;
    let angle = 0;

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas === null) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        console.log('mouseX:', mouseX, 'mouseY:', mouseY);

        if (mouseX >= x && mouseX <= x + boxWidth && mouseY >= y && mouseY <= y + boxHeight) {
            console.log('Box clicked!');
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

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'red';
            ctx.fillRect(x, y, boxWidth, boxHeight);

            x += Math.cos(angle);
            x = Math.min(x, canvas.width - boxWidth);
            x = Math.max(x, 0);
            y += Math.sin(angle);
            y = Math.min(y, canvas.height - boxHeight);
            y = Math.max(y, 0);
            angle += 0.5 * Math.random() - 0.25;

            requestAnimationFrame(animate);
        };

        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return <div style={{ display: 'flex', height: '100vh' }}>
        <canvas ref={canvasRef} onClick={handleCanvasClick} />
    </div>;
};

export default Carnival;
