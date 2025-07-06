import { coerceToRange } from "../../../util/Math";
import { randomNum } from "../../../util/Randomizer";
import { GameWorld, MouseEvents, TouchEvents } from "../GameWorld";
import { collision } from "./Collisions";
import { Box, Position, Ring } from "./Data";

const GAME_OVER_TIME = 8000;
const PERFECT_BONUS_TIME = 1000;
const PERFECT_SPEED = 0.6;

export class CarnivalWorld implements GameWorld {
    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;
    readonly endWorld: () => void;

    level: number;
    noMisses: boolean;
    finalTime: string | null;
    readonly boxes: Array<Box>;
    readonly rings: Array<Ring>;
    startTime: number;
    perfectTime: number | null;

    constructor(
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
        endWorld: () => void
    ) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.endWorld = endWorld;

        this.level = 0;
        this.noMisses = true;
        this.finalTime = null;
        this.boxes = [this.createBox(this.level)];
        this.rings = new Array<Ring>();
        this.startTime = performance.now();
        this.perfectTime = null;
    }

    public draw() {
        if (this.perfectTime !== null && this.perfectTime >= performance.now()) {
            this.ctx.fillStyle = 'grey';
            this.ctx.beginPath();
            const remainingTimePercentage = (performance.now() - this.perfectTime) / PERFECT_BONUS_TIME;
            const startAngle = -Math.PI / 2;
            const endAngle = startAngle - 2 * Math.PI * remainingTimePercentage;
            this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 4, startAngle, endAngle);
            this.ctx.lineTo(this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.strokeStyle = 'gold';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            this.ctx.fillStyle = 'white';
            this.ctx.font = `${this.getFontSize() / 2}px sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('YOU ARE', this.canvas.width / 2, 0.25 * this.canvas.height);
            this.ctx.fillText('IN THE ZONE', this.canvas.width / 2, 0.75 * this.canvas.height);
        }

        if (this.finalTime === null) {
            this.drawTime();
        }

        for (const ring of this.rings) {
            this.ctx.beginPath();
            this.ctx.arc(ring.pos.x, ring.pos.y, ring.radius, 0, Math.PI * 2);
            this.ctx.closePath();
            this.ctx.strokeStyle = 'grey';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        for (const box of this.boxes) {
            this.ctx.fillStyle = box.color;
            const x = box.pos.x * this.canvas.width;
            const y = box.pos.y * this.canvas.height;
            const width = box.width * this.canvas.width;
            const height = box.height * this.canvas.height;
            this.ctx.fillRect(x, y, width, height);

            if (box.isPerfect !== null) {
                this.ctx.strokeStyle = box.isPerfect ? 'white' : 'black';
                this.ctx.lineWidth = 7;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x + width, y + height);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(x + width, y);
                this.ctx.lineTo(x, y + height);
                this.ctx.stroke();
            }

            if (box.hitColor !== null) {
                this.ctx.strokeStyle = box.hitColor;
                this.ctx.lineWidth = 7;
                this.ctx.strokeRect(x, y, width, height);
            }
        }

        if (this.finalTime !== null) {
            this.drawTime();
        }
    }

    public update(deltaTime: number) {
        for (const ring of this.rings) {
            ring.radius += 0.00085 * deltaTime * this.canvas.height;
        }

        for (let i = this.rings.length - 1; i >= 0; i--) {
            if (this.rings[i].radius > this.canvas.width && this.rings[i].radius > this.canvas.height) {
                this.rings.splice(i, 1);
            }
        }

        for (const box of this.boxes) {
            box.previousPos.x = box.pos.x;
            box.previousPos.y = box.pos.y;

            const speedScale = this.perfectTime !== null && this.perfectTime >= performance.now() ? PERFECT_SPEED : 1;

            box.pos.x += speedScale * box.speed * Math.cos(box.angle) * deltaTime;
            box.pos.x = coerceToRange(box.pos.x, 0, 1 - box.width);

            box.pos.y += speedScale * box.speed * Math.sin(box.angle) * deltaTime;
            box.pos.y = coerceToRange(box.pos.y, 0, 1 - box.height);

            box.angle += randomNum(-0.06, 0.06) * deltaTime;
        }
    }

    private onTouchStart(e: TouchEvent) {
        if (e.touches.length >= 3) {
            this.level = 0;
            this.noMisses = true;
            this.finalTime = null;
            this.boxes.splice(0, this.boxes.length, this.createBox(this.level));
            this.rings.splice(0, this.rings.length);
            this.startTime = performance.now();
            this.perfectTime = null;
        }
    }

    private onClick(e: MouseEvent) {
        if (this.finalTime !== null) return;

        this.handleClick(e, () => {
            this.level++;

            if (this.noMisses) {
                if (this.perfectTime === null || this.perfectTime < performance.now()) {
                    this.perfectTime = performance.now() + PERFECT_BONUS_TIME;
                } else {
                    this.perfectTime += PERFECT_BONUS_TIME;
                }
            }

            if (this.level >= 6) {
                this.finalTime = this.getStopwatch();
                setTimeout(() => {
                    this.endWorld();
                }, GAME_OVER_TIME);
            } else {
                this.boxes.push(this.createBox(this.level));
            }

            this.noMisses = true;
        }, () => {
            this.noMisses = false;
        });
    }

    private getFontSize(): number {
        return this.canvas.height * 0.06;
    }

    private handleClick(
        e: MouseEvent,
        onHit: () => void,
        onMiss: () => void
    ) {
        const mouseX = e.pageX;
        const mouseY = e.pageY;

        this.rings.push({
            pos: {
                x: mouseX,
                y: mouseY,
            },
            radius: 10
        });

        const targetBox = this.boxes[this.level];

        const hit = collision({ x: mouseX / this.canvas.width, y: mouseY / this.canvas.height }, targetBox);
        const hitPreviousPos = collision({ x: mouseX / this.canvas.width, y: mouseY / this.canvas.height }, targetBox, true);
        if (hit || hitPreviousPos) {
            targetBox.hitColor = hit ? 'white' : 'gold';
            targetBox.isPerfect = this.noMisses ? true : false;
            onHit();
        } else {
            onMiss();
        }
    }

    private drawTime() {
        const text = this.finalTime === null ? this.getStopwatch() : `Game Over: ${this.finalTime}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = 'white';
        this.ctx.font = `${this.getFontSize()}px sans-serif`;
        this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
    }

    private getStopwatch(): string {
        const time = ((performance.now() - this.startTime) / 1000).toFixed(1);
        return `${time}`;
    }

    private createBox(level: number): Box {
        const size = this.getSize(level);
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
            color: this.getColor(level),
            speed: this.getSpeed(level),
            hitColor: null,
            isPerfect: null
        };
    }

    private getSize(level: number): number {
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

    private getSpeed(level: number): number {
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

    private getColor(level: number): string {
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

    public mouseEvents: MouseEvents = {
        onClick: (e) => {
            this.onClick(e);
        }
    }

    public touchEvents: TouchEvents = {
        onTouchStart: (e) => {
            this.onTouchStart(e);
        }
    }
}
