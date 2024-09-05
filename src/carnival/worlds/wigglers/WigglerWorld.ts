import { GameWorld } from "../GameWorld";

export class WigglerWorld implements GameWorld {
    draw(): void {
        throw new Error("Method not implemented.");
    }
    update(deltaTime: number): void {
        throw new Error("Method not implemented.");
    }
    onTouchStart(e: TouchEvent): void {
        throw new Error("Method not implemented.");
    }
    onClick(e: MouseEvent): void {
        throw new Error("Method not implemented.");
    }
}
