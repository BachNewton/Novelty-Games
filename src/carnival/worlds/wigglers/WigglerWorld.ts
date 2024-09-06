import { randomNum, shuffleArray } from "../../../util/Randomizer";
import { GameWorld } from "../GameWorld";
import { Connection, HeldWiggler, Wiggler, createWiggler } from "./Data";
import { checkEachPair, checkIntersection, isTouching } from "./Logic";

const STARTUP_MOVE_SPEED = 0.0004;
const WIGGLER_MOVE_TO_SATRTUP_THRESHOLD = 0.005;

export class WigglerWorld implements GameWorld {
    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;

    readonly wigglers: Array<Wiggler>;
    readonly wigglersStarting: Array<Wiggler>;
    readonly connections: Array<Connection>;
    heldWiggler: HeldWiggler | null = null;
    level: number;
    isInStartup: boolean;

    constructor(
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D
    ) {
        this.canvas = canvas;
        this.ctx = ctx;

        // const wiggler1 = createWiggler({ x: 0.5, y: 0.5 });
        // const wiggler2 = createWiggler({ x: 0.25, y: 0.25 });
        // const wiggler3 = createWiggler({ x: 0.75, y: 0.25 });
        // const wiggler4 = createWiggler({ x: 0.25, y: 0.75 });
        // const wiggler5 = createWiggler({ x: 0.75, y: 0.75 });
        // const wiggler6 = createWiggler({ x: (2 / 3), y: 0.5 });

        // this.wigglers = [wiggler1, wiggler2, wiggler3, wiggler4, wiggler5, wiggler6];

        // this.connections = [
        //     { a: wiggler2, b: wiggler3, isUninterrupted: true },
        //     { a: wiggler2, b: wiggler4, isUninterrupted: true },
        //     { a: wiggler3, b: wiggler5, isUninterrupted: true },
        //     { a: wiggler4, b: wiggler5, isUninterrupted: true },
        //     { a: wiggler1, b: wiggler2, isUninterrupted: true },
        //     { a: wiggler1, b: wiggler3, isUninterrupted: true },
        //     { a: wiggler1, b: wiggler4, isUninterrupted: true },
        //     { a: wiggler1, b: wiggler5, isUninterrupted: true },
        //     { a: wiggler1, b: wiggler6, isUninterrupted: true }
        // ];

        this.level = 5;
        this.isInStartup = true;

        this.wigglers = Array.from({ length: this.level }, () => createWiggler({ x: randomNum(0, 1), y: randomNum(0, 1) }));
        this.connections = [];

        const allConnections = new Array<Connection>();
        for (let i = 0; i < this.wigglers.length - 1; i++) {
            for (let j = i + 1; j < this.wigglers.length; j++) {
                allConnections.push({ a: this.wigglers[i], b: this.wigglers[j] });
            }
        }

        const shuffledConnections = shuffleArray(allConnections);
        for (const connection of shuffledConnections) {
            let noIntersections = true;

            for (const selectedConnections of this.connections) {
                if (checkIntersection(connection, selectedConnections)) {
                    noIntersections = false;
                    break;
                }
            }

            if (noIntersections) {
                this.connections.push(connection);
            }
        }

        this.wigglersStarting = this.wigglers.map(() => createWiggler({ x: randomNum(0, 1), y: randomNum(0, 1) }));
    }

    draw(): void {
        for (const connection of this.connections) {
            this.ctx.beginPath();
            this.ctx.moveTo(connection.a.position.x * this.canvas.width, connection.a.position.y * this.canvas.height);
            this.ctx.lineTo(connection.b.position.x * this.canvas.width, connection.b.position.y * this.canvas.height);
            this.ctx.strokeStyle = connection.isUninterrupted ? 'white' : 'red';
            this.ctx.lineWidth = connection.isUninterrupted ? 2 : 3;
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
        if (this.isInStartup) {
            let atLeastOneWigglerWasMoved = false;

            this.wigglers.forEach((wiggler, index) => {
                if (Math.abs(wiggler.position.x - this.wigglersStarting[index].position.x) < WIGGLER_MOVE_TO_SATRTUP_THRESHOLD && Math.abs(wiggler.position.y - this.wigglersStarting[index].position.y) < WIGGLER_MOVE_TO_SATRTUP_THRESHOLD) {
                    return;
                }

                atLeastOneWigglerWasMoved = true;

                const directionX = wiggler.position.x > this.wigglersStarting[index].position.x ? -1 : 1;
                const directionY = wiggler.position.y > this.wigglersStarting[index].position.y ? -1 : 1;

                wiggler.position.x += directionX * STARTUP_MOVE_SPEED * deltaTime;
                wiggler.position.y += directionY * STARTUP_MOVE_SPEED * deltaTime;
            });

            if (!atLeastOneWigglerWasMoved) {
                this.isInStartup = false;
            }
        }

        this.connections.forEach(connection => connection.isUninterrupted = true);

        checkEachPair(this.connections, (a, b) => {
            if (checkIntersection(a, b)) {
                a.isUninterrupted = false;
                b.isUninterrupted = false;
            }
        });
    }

    onTouchStart(e: TouchEvent): void {
        // TODO
    }

    onClick(e: MouseEvent): void {
        // TODO
    }

    onMouseDown(x: number, y: number): void {
        if (this.isInStartup) return;

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
