import { GameWorld } from "../GameWorld";
import { Connection, HeldWiggler, Wiggler, createWiggler } from "./Data";
import { checkEachPair, checkIntersection, isTouching } from "./Logic";

export class WigglerWorld implements GameWorld {
    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;

    readonly wigglers: Array<Wiggler>;
    readonly connections: Array<Connection>;
    heldWiggler: HeldWiggler | null = null;

    constructor(
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D
    ) {
        this.canvas = canvas;
        this.ctx = ctx;

        const wiggler1 = createWiggler({ x: 0.5, y: 0.5 });
        const wiggler2 = createWiggler({ x: 0.25, y: 0.25 });
        const wiggler3 = createWiggler({ x: 0.75, y: 0.25 });
        const wiggler4 = createWiggler({ x: 0.25, y: 0.75 });
        const wiggler5 = createWiggler({ x: 0.75, y: 0.75 });

        this.wigglers = [wiggler1, wiggler2, wiggler3, wiggler4, wiggler5];

        this.connections = [
            { a: wiggler2, b: wiggler3, isUninterrupted: true },
            { a: wiggler2, b: wiggler4, isUninterrupted: true },
            { a: wiggler3, b: wiggler5, isUninterrupted: true },
            { a: wiggler4, b: wiggler5, isUninterrupted: true },
            { a: wiggler1, b: wiggler2, isUninterrupted: true },
            { a: wiggler1, b: wiggler3, isUninterrupted: true },
            { a: wiggler1, b: wiggler4, isUninterrupted: true },
            { a: wiggler1, b: wiggler5, isUninterrupted: true }
        ];

        // const temp = checkIntersection(
        //     { a: createWiggler({ x: 0, y: 0 }), b: createWiggler({ x: 1, y: 1 }), isUninterrupted: true },
        //     { a: createWiggler({ x: 1, y: 0 }), b: createWiggler({ x: 0, y: 1 }), isUninterrupted: true }
        // );

        // const temp2 = checkIntersection(
        //     { a: createWiggler({ x: 0, y: 0 }), b: createWiggler({ x: 0, y: 1 }), isUninterrupted: true },
        //     { a: createWiggler({ x: 0, y: 0 }), b: createWiggler({ x: 1, y: 0 }), isUninterrupted: true }
        // );

        // console.log(temp2);
    }

    draw(): void {
        checkEachPair(this.connections, (a, b) => {
            const isIntersection = checkIntersection(a, b);
            a.isUninterrupted = !isIntersection;
            b.isUninterrupted = !isIntersection;

            // if (isIntersection) {
            //     console.log('isIntersection', a, b);
            // }
        });

        for (const connection of this.connections) {
            this.ctx.beginPath();
            this.ctx.moveTo(connection.a.position.x * this.canvas.width, connection.a.position.y * this.canvas.height);
            this.ctx.lineTo(connection.b.position.x * this.canvas.width, connection.b.position.y * this.canvas.height);
            this.ctx.strokeStyle = connection.isUninterrupted ? 'white' : 'red';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        for (const wiggler of this.wigglers) {
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

    onMouseDown(x: number, y: number): void {
        for (const wiggler of this.wigglers) {
            if (isTouching(x, y, wiggler)) {
                this.heldWiggler = {
                    wiggler: wiggler,
                    offset: {
                        x: wiggler.position.x - x,
                        y: wiggler.position.y - y
                    }
                };

                return;
            }
        }
    }

    onMouseMove(x: number, y: number): void {
        if (this.heldWiggler !== null) {
            this.heldWiggler.wiggler.position.x = x + this.heldWiggler.offset.x;
            this.heldWiggler.wiggler.position.y = y + this.heldWiggler.offset.y;
        }
    }

    onMouseUp(x: number, y: number): void {
        this.heldWiggler = null;
    }
}
