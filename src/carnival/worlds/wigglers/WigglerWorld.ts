import { randomNum, shuffleArray } from "../../../util/Randomizer";
import { GameWorld } from "../GameWorld";
import { Connection, HeldWiggler, Wiggler, createWiggler } from "./Data";
import { checkEachPair, checkIntersection, isTouching } from "./Logic";

const WIGGLE_MOVE_SPEED = 0.0002;
const STARTING_UI_STATE_TIME = 3000;
const WIGGLER_MOVE_TO_SATRTUP_THRESHOLD = 0.005;
const HAPPY_TIME_REQUIREMENT = 2500;
const STARTING_LEVEL = 5;
const MAX_ROUNDS = 3;

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
    round: number;
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
        this.uiState = new UiState(-1);

        this.level = STARTING_LEVEL;
        this.round = 0;

        this.setupWigglers();
    }

    public draw(): void {
        if (this.uiState instanceof AngryUiState) {
            this.drawHUD();
        }

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

        if (!(this.uiState instanceof AngryUiState)) {
            this.drawHUD();
        }
    }

    public update(deltaTime: number): void {
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

                wiggler.position.x += directionX * WIGGLE_MOVE_SPEED * deltaTime;
                wiggler.position.y += directionY * WIGGLE_MOVE_SPEED * deltaTime;
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
            this.setupWigglers();
        }
    }

    public onTouchStart(e: TouchEvent): void {
        const x = e.touches[0].pageX / this.canvas.width;
        const y = e.touches[0].pageY / this.canvas.height;
        this.handleActionDown(x, y);
    }

    public onTouchMove(e: TouchEvent): void {
        const x = e.touches[0].pageX / this.canvas.width;
        const y = e.touches[0].pageY / this.canvas.height;
        this.handleActionMove(x, y);
    }

    public onTouchEnd(e: TouchEvent): void {
        this.handleActionUp();
    }

    public onClick(e: MouseEvent): void {
        // TODO
    }

    public onMouseDown(x: number, y: number): void {
        this.handleActionDown(x, y);
    }

    public onMouseMove(x: number, y: number): void {
        this.handleActionMove(x, y);
    }

    public onMouseUp(x: number, y: number): void {
        this.handleActionUp();
    }

    private handleActionDown(x: number, y: number): void {
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

    private handleActionMove(x: number, y: number): void {
        if (this.heldWiggler === null) return;

        this.heldWiggler.wiggler.position.x = x + this.heldWiggler.offset.x;
        this.heldWiggler.wiggler.position.y = y + this.heldWiggler.offset.y;
    }

    private handleActionUp(): void {
        this.heldWiggler = null;
    }

    private setupWigglers() {
        this.round++;
        if (this.round > MAX_ROUNDS) {
            this.round = 1;
            this.level++;
        }

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

    private drawHUD() {
        const text = this.getText();
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = this.uiState instanceof AngryUiState ? 'grey' : this.uiState instanceof WigglingUiState ? 'HotPink' : this.uiState instanceof HappyUiState ? 'lime' : 'Yellow';
        const fontSize = this.getFontSize();
        this.ctx.font = `${fontSize}px sans-serif`;

        let height = this.canvas.height / 2;
        for (const line of text) {
            this.ctx.fillText(line, this.canvas.width / 2, height);
            height += fontSize;
        }

        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'top';
        this.ctx.fillStyle = 'white';
        const halfFont = fontSize / 2;
        this.ctx.font = `${halfFont}px sans-serif`;
        this.ctx.fillText(`Level: ${this.level - STARTING_LEVEL + 1}`, this.canvas.width - 10, 10);
        this.ctx.fillText(`Round: ${this.round} of ${MAX_ROUNDS}`, this.canvas.width - 10, 10 + halfFont);
    }

    private getText(): Array<string> {
        if (this.uiState instanceof StartingUiState) {
            return ["These are", "happy Wigglers"];
        } else if (this.uiState instanceof WigglingUiState) {
            return ["Oh no!", '', "The Wigglers", "are wiggling again!"];
        } else if (this.uiState instanceof AngryUiState) {
            return ["Please help", "the Wigglers", "find happpiness!"];
        } else if (this.uiState instanceof HappyUiState) {
            return ["The Wigglers", "are happy again!"];
        } else {
            throw new Error(`UiState not valid: ${this.uiState}`);
        }
    }

    private getFontSize(): number {
        return this.canvas.height * 0.06;
    }
}
