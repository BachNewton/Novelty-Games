// Snake game input handling

import { Direction, MIN_SPEED_MULTIPLIER, MAX_SPEED_MULTIPLIER, SPEED_STEP } from './types';

export interface InputCallbacks {
    onDirectionChange: (direction: Direction) => void;
    onToggleAI: () => void;
    onToggleVisualization: () => void;
    onToggleHeadless: () => void;
    onRestart: () => void;
    onSpeedChange: (multiplier: number) => void;
    getCurrentDirection: () => Direction;
    isGameOver: () => boolean;
    isAIMode: () => boolean;
}

export class SnakeInput {
    private pressedKeys: Set<string> = new Set();
    private keyDownHandler: ((e: KeyboardEvent) => void) | null = null;
    private keyUpHandler: ((e: KeyboardEvent) => void) | null = null;
    private callbacks: InputCallbacks;
    private speedMultiplier: number = 1.0;

    constructor(callbacks: InputCallbacks) {
        this.callbacks = callbacks;
        this.setupKeyboardListeners();
    }

    private setupKeyboardListeners(): void {
        this.keyDownHandler = (e: KeyboardEvent) => {
            this.pressedKeys.add(e.code);
            this.handleKeyPress(e.code);
        };

        this.keyUpHandler = (e: KeyboardEvent) => {
            this.pressedKeys.delete(e.code);
        };

        window.addEventListener('keydown', this.keyDownHandler);
        window.addEventListener('keyup', this.keyUpHandler);
    }

    private handleKeyPress(keyCode: string): void {
        // Toggle AI mode with 'A' key
        if (keyCode === 'KeyA' || keyCode === 'Keya') {
            this.callbacks.onToggleAI();
            return;
        }

        // Toggle visualization with 'V' key
        if (keyCode === 'KeyV' || keyCode === 'Keyv') {
            this.callbacks.onToggleVisualization();
            return;
        }

        // Toggle headless mode with 'H' key (only in AI mode)
        if (keyCode === 'KeyH' || keyCode === 'Keyh') {
            if (this.callbacks.isAIMode()) {
                this.callbacks.onToggleHeadless();
            }
            return;
        }

        // Speed controls
        if (keyCode === 'Equal' || keyCode === 'NumpadAdd') {
            this.increaseSpeed();
            return;
        }
        if (keyCode === 'Minus' || keyCode === 'NumpadSubtract') {
            this.decreaseSpeed();
            return;
        }
        if (keyCode === 'Digit0' || keyCode === 'Numpad0') {
            this.speedMultiplier = 1.0;
            this.callbacks.onSpeedChange(this.speedMultiplier);
            return;
        }

        if (this.callbacks.isGameOver()) {
            if (keyCode === 'Space') {
                this.callbacks.onRestart();
            }
            return;
        }

        // Don't process arrow keys if AI is controlling
        if (this.callbacks.isAIMode()) {
            return;
        }

        const currentDir = this.callbacks.getCurrentDirection();
        let newDirection: Direction | null = null;

        switch (keyCode) {
            case 'ArrowUp':
                if (currentDir !== Direction.DOWN) newDirection = Direction.UP;
                break;
            case 'ArrowDown':
                if (currentDir !== Direction.UP) newDirection = Direction.DOWN;
                break;
            case 'ArrowLeft':
                if (currentDir !== Direction.RIGHT) newDirection = Direction.LEFT;
                break;
            case 'ArrowRight':
                if (currentDir !== Direction.LEFT) newDirection = Direction.RIGHT;
                break;
        }

        if (newDirection !== null) {
            this.callbacks.onDirectionChange(newDirection);
        }
    }

    private increaseSpeed(): void {
        let step = SPEED_STEP;
        if (this.speedMultiplier >= 100) step = 50;
        else if (this.speedMultiplier >= 10) step = 5;

        this.speedMultiplier = Math.min(
            MAX_SPEED_MULTIPLIER,
            this.speedMultiplier + step
        );
        this.callbacks.onSpeedChange(this.speedMultiplier);
    }

    private decreaseSpeed(): void {
        let step = SPEED_STEP;
        if (this.speedMultiplier > 100) step = 50;
        else if (this.speedMultiplier > 10) step = 5;

        this.speedMultiplier = Math.max(
            MIN_SPEED_MULTIPLIER,
            this.speedMultiplier - step
        );
        this.callbacks.onSpeedChange(this.speedMultiplier);
    }

    getSpeedMultiplier(): number {
        return this.speedMultiplier;
    }

    setSpeedMultiplier(multiplier: number): void {
        this.speedMultiplier = multiplier;
    }

    cleanup(): void {
        if (this.keyDownHandler) {
            window.removeEventListener('keydown', this.keyDownHandler);
        }
        if (this.keyUpHandler) {
            window.removeEventListener('keyup', this.keyUpHandler);
        }
    }
}
