import { randomNum, shuffleArray } from "../../../util/Randomizer";
import { GameWorld } from "../GameWorld";
import { Connection, HeldWiggler, Wiggler, createWiggler } from "./Data";
import { checkEachPair, checkIntersection, isTouching } from "./Logic";

const STARTUP_MOVE_SPEED = 0.0005;
const STARTING_UI_STATE_TIME = 2500;
const WIGGLER_MOVE_TO_SATRTUP_THRESHOLD = 0.005;
const HAPPY_TIME_REQUIREMENT = 1500;

class UiState {
    start: number;

    constructor(start: number) {
        this.start = start;
    }
}

class StartingUiState extends UiState {
    constructor(start: number) {
        super(start);
    }
}

class WigglingUiState extends UiState {
    constructor(start: number) {
        super(start);
    }
}

class AngryUiState extends UiState {
    constructor(start: number) {
        super(start);
    }
}

class HappyUiState extends UiState {
    constructor(start: number) {
        super(start);
    }
}

export class WigglerWorld implements GameWorld {
    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;

    wigglers: Array<Wiggler>;
    wigglersStarting: Array<Wiggler>;
    connections: Array<Connection>;
    heldWiggler: HeldWiggler | null = null;
    level: number;
    uiState: UiState;

    constructor(
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D
    ) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.wigglers = [];
        this.connections = [];
        this.wigglersStarting = [];
        this.level = -1;
        this.uiState = new UiState(-1);

        this.setupWigglers(5);
    }

    setupWigglers(level: number) {
        this.level = level;

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

        this.uiState = new StartingUiState(performance.now());
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
            this.ctx.fillStyle = this.uiState instanceof HappyUiState ? 'green' : 'blue';
            this.ctx.fill();
        }
    }

    update(deltaTime: number): void {
        if (this.uiState instanceof StartingUiState && performance.now() - this.uiState.start >= STARTING_UI_STATE_TIME) {
            this.uiState = new WigglingUiState(performance.now());
        }

        if (this.uiState instanceof WigglingUiState) {
            let atLeastOneWigglerWasMoved = false;

            this.wigglers.forEach((wiggler, index) => {
                if (
                    Math.abs(
                        wiggler.position.x - this.wigglersStarting[index].position.x
                    ) < WIGGLER_MOVE_TO_SATRTUP_THRESHOLD
                    &&
                    Math.abs(
                        wiggler.position.y - this.wigglersStarting[index].position.y
                    ) < WIGGLER_MOVE_TO_SATRTUP_THRESHOLD
                ) {
                    return;
                }

                atLeastOneWigglerWasMoved = true;

                const directionX = wiggler.position.x > this.wigglersStarting[index].position.x ? -1 : 1;
                const directionY = wiggler.position.y > this.wigglersStarting[index].position.y ? -1 : 1;

                wiggler.position.x += directionX * STARTUP_MOVE_SPEED * deltaTime;
                wiggler.position.y += directionY * STARTUP_MOVE_SPEED * deltaTime;
            });

            if (!atLeastOneWigglerWasMoved) {
                this.uiState = new AngryUiState(performance.now());
            }
        }

        this.connections.forEach(connection => connection.isUninterrupted = true);

        let allWigglersAreUninterrupted = true;

        checkEachPair(this.connections, (a, b) => {
            if (checkIntersection(a, b)) {
                a.isUninterrupted = false;
                b.isUninterrupted = false;
                allWigglersAreUninterrupted = false;
            }
        });

        if (allWigglersAreUninterrupted) {
            if (this.uiState instanceof AngryUiState) {
                this.uiState = new HappyUiState(performance.now());
            }
        } else {
            if (this.uiState instanceof HappyUiState) {
                this.uiState = new AngryUiState(performance.now());
            }
        }

        if (this.uiState instanceof HappyUiState && performance.now() - this.uiState.start >= HAPPY_TIME_REQUIREMENT) {
            this.setupWigglers(this.level + 1);
        }
    }

    onTouchStart(e: TouchEvent): void {
        // TODO
    }

    onClick(e: MouseEvent): void {
        // TODO
    }

    onMouseDown(x: number, y: number): void {
        if (this.uiState instanceof StartingUiState || this.uiState instanceof WigglingUiState) return;

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
