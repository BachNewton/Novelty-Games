import { GameWorld } from "../GameWorld";
import { createWiggler } from "./Data";

export class WigglerWorld implements GameWorld {
    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;

    constructor(
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D
    ) {
        this.canvas = canvas;
        this.ctx = ctx;
    }

    draw(): void {
        const wiggler1 = createWiggler({ x: 0.5, y: 0.5 });
        const wiggler2 = createWiggler({ x: 0.25, y: 0.25 });
        const wiggler3 = createWiggler({ x: 0.75, y: 0.25 });
        const wiggler4 = createWiggler({ x: 0.25, y: 0.75 });
        const wiggler5 = createWiggler({ x: 0.75, y: 0.75 });

        wiggler1.connections = [wiggler2, wiggler3, wiggler4, wiggler5];
        wiggler2.connections = [wiggler3, wiggler4];
        wiggler5.connections = [wiggler3, wiggler4];

        const wigglers = [wiggler1, wiggler2, wiggler3, wiggler4, wiggler5];

        for (const wiggler of wigglers) {
            for (const connection of wiggler.connections) {
                this.ctx.beginPath();
                this.ctx.moveTo(wiggler.position.x * this.canvas.width, wiggler.position.y * this.canvas.height);
                this.ctx.lineTo(connection.position.x * this.canvas.width, connection.position.y * this.canvas.height);
                this.ctx.strokeStyle = 'white';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        }

        for (const wiggler of wigglers) {
            this.ctx.beginPath();
            this.ctx.arc(wiggler.position.x * this.canvas.width, wiggler.position.y * this.canvas.height, wiggler.size * this.canvas.height, 0, Math.PI * 2);
            this.ctx.closePath();
            this.ctx.fillStyle = 'blue';
            this.ctx.fill();
        }
    }

    update(deltaTime: number): void {
        // TODO
    }

    onTouchStart(e: TouchEvent): void {
        // TODO
    }

    onClick(e: MouseEvent): void {
        // TODO
    }
}
