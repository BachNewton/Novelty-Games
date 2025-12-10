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
    private touchStartHandler: ((e: TouchEvent) => void) | null = null;
    private touchMoveHandler: ((e: TouchEvent) => void) | null = null;
    private touchEndHandler: ((e: TouchEvent) => void) | null = null;
    private callbacks: InputCallbacks;
    private speedMultiplier: number = 1.0;
    private touchStartX: number = 0;
    private touchStartY: number = 0;
    private isTouchingGame: boolean = false;
    private static readonly SWIPE_THRESHOLD = 30;

    constructor(callbacks: InputCallbacks) {
        this.callbacks = callbacks;
        this.setupKeyboardListeners();
        this.setupTouchListeners();
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

    private setupTouchListeners(): void {
        this.touchStartHandler = (e: TouchEvent) => {
            // Ignore if touch started on a UI element (button, menu, etc.)
            const target = e.target as HTMLElement;
            if (target.tagName === 'BUTTON' || target.closest('button') || target.closest('[data-mobile-controls]')) {
                this.isTouchingGame = false;
                return;
            }

            this.isTouchingGame = true;
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        };

        this.touchMoveHandler = (e: TouchEvent) => {
            // Prevent pull-to-refresh and other browser gestures when playing
            if (this.isTouchingGame) {
                e.preventDefault();
            }
        };

        this.touchEndHandler = (e: TouchEvent) => {
            if (!this.isTouchingGame) {
                return;
            }

            this.isTouchingGame = false;
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - this.touchStartX;
            const deltaY = touch.clientY - this.touchStartY;

            this.handleSwipe(deltaX, deltaY);
        };

        window.addEventListener('touchstart', this.touchStartHandler, { passive: true });
        window.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
        window.addEventListener('touchend', this.touchEndHandler, { passive: true });
    }

    private handleSwipe(deltaX: number, deltaY: number): void {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // Check if swipe is long enough
        if (absX < SnakeInput.SWIPE_THRESHOLD && absY < SnakeInput.SWIPE_THRESHOLD) {
            // Tap - treat as restart if game over
            if (this.callbacks.isGameOver()) {
                this.callbacks.onRestart();
            }
            return;
        }

        // Don't process swipes if AI is controlling
        if (this.callbacks.isAIMode()) {
            return;
        }

        const currentDir = this.callbacks.getCurrentDirection();
        let newDirection: Direction | null = null;

        // Determine swipe direction based on larger delta
        if (absX > absY) {
            // Horizontal swipe
            if (deltaX > 0 && currentDir !== Direction.LEFT) {
                newDirection = Direction.RIGHT;
            } else if (deltaX < 0 && currentDir !== Direction.RIGHT) {
                newDirection = Direction.LEFT;
            }
        } else {
            // Vertical swipe
            if (deltaY > 0 && currentDir !== Direction.UP) {
                newDirection = Direction.DOWN;
            } else if (deltaY < 0 && currentDir !== Direction.DOWN) {
                newDirection = Direction.UP;
            }
        }

        if (newDirection !== null) {
            this.callbacks.onDirectionChange(newDirection);
        }
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
        if (this.touchStartHandler) {
            window.removeEventListener('touchstart', this.touchStartHandler);
        }
        if (this.touchMoveHandler) {
            window.removeEventListener('touchmove', this.touchMoveHandler);
        }
        if (this.touchEndHandler) {
            window.removeEventListener('touchend', this.touchEndHandler);
        }
    }
}
