import { GameWorld } from "../GameWorld";
import { SnakeAI } from "./SnakeAI";
import { createSnakeAISorage, SnakeAISaveData } from "./SnakeAISorage";
import { createAIVisualizationOverlay } from "./ui/AIVisualization";

export enum Direction {
    UP = 'UP',
    DOWN = 'DOWN',
    LEFT = 'LEFT',
    RIGHT = 'RIGHT'
}

export interface Position {
    x: number;
    y: number;
}

export interface SnakeGameState {
    snake: Position[];
    food: Position;
    direction: Direction;
    nextDirection: Direction;
    score: number;
    gameOver: boolean;
    gridSize: number;
    cellSize: number;
}

const GRID_SIZE = 20; // 20x20 grid
const INITIAL_SNAKE_LENGTH = 3;
const GAME_SPEED_MS = 150; // milliseconds between moves
const MIN_SPEED_MULTIPLIER = 0.5; // Half speed
const MAX_SPEED_MULTIPLIER = 1000; // 1000x speed for ultra-fast training
const SPEED_STEP = 0.5; // Speed increment/decrement (use larger steps at high speeds)

export class SnakeWorld implements GameWorld {
    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;

    private gameState: SnakeGameState;
    private lastMoveTime: number = 0;
    private gameOverTime: number = 0;
    private pressedKeys: Set<string> = new Set();
    private keyDownHandler: ((e: KeyboardEvent) => void) | null = null;
    private keyUpHandler: ((e: KeyboardEvent) => void) | null = null;

    private ai: SnakeAI | null = null;
    private aiMode: boolean = false;
    private lastScore: number = 0;
    private lastFoodPosition: Position | null = null;
    private lastHeadPosition: Position | null = null; // Track previous head position for distance calculation
    private aiStorage = createSnakeAISorage();
    private saveInterval: number | null = null;
    private speedMultiplier: number = 1.0; // Game speed multiplier
    private showVisualization: boolean = false;
    private lastStateBeforeMove: number[] | null = null;
    private lastActionBeforeMove: number | null = null;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gameState = this.initializeGame();
        this.setupKeyboardListeners();
        this.loadAI();
    }

    private initializeGame(): SnakeGameState {
        const gridSize = GRID_SIZE;
        const cellSize = Math.min(this.canvas.width, this.canvas.height) / gridSize;

        // Start snake in the middle, facing right
        const startX = Math.floor(gridSize / 2);
        const startY = Math.floor(gridSize / 2);
        const snake: Position[] = [];

        for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
            snake.push({ x: startX - i, y: startY });
        }

        return {
            snake,
            food: this.generateFood(snake, gridSize),
            direction: Direction.RIGHT,
            nextDirection: Direction.RIGHT,
            score: 0,
            gameOver: false,
            gridSize,
            cellSize
        };
    }

    private generateFood(snake: Position[], gridSize: number): Position {
        let food: Position;
        do {
            food = {
                x: Math.floor(Math.random() * gridSize),
                y: Math.floor(Math.random() * gridSize)
            };
        } while (snake.some(segment => segment.x === food.x && segment.y === food.y));

        return food;
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

    // Cleanup method (can be called when game world is destroyed)
    public cleanup(): void {
        if (this.keyDownHandler) {
            window.removeEventListener('keydown', this.keyDownHandler);
        }
        if (this.keyUpHandler) {
            window.removeEventListener('keyup', this.keyUpHandler);
        }
        this.stopAITraining();
    }

    private handleKeyPress(keyCode: string): void {
        // Toggle AI mode with 'A' key
        if (keyCode === 'KeyA' || keyCode === 'Keya') {
            this.toggleAIMode();
            return;
        }

        // Toggle visualization with 'V' key
        if (keyCode === 'KeyV' || keyCode === 'Keyv') {
            this.showVisualization = !this.showVisualization;
            return;
        }

        // Speed controls
        if (keyCode === 'Equal' || keyCode === 'NumpadAdd') {
            // + key to increase speed
            this.increaseSpeed();
            return;
        }
        if (keyCode === 'Minus' || keyCode === 'NumpadSubtract') {
            // - key to decrease speed
            this.decreaseSpeed();
            return;
        }
        if (keyCode === 'Digit0' || keyCode === 'Numpad0') {
            // 0 key to reset speed to 1x
            this.speedMultiplier = 1.0;
            return;
        }

        if (this.gameState.gameOver) {
            if (keyCode === 'Space') {
                this.restartGame();
            }
            return;
        }

        // Don't process arrow keys if AI is controlling
        if (this.aiMode && this.ai) {
            return;
        }

        const currentDir = this.gameState.direction;
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
            this.gameState.nextDirection = newDirection;
        }
    }

    private increaseSpeed(): void {
        // Use larger steps at higher speeds for easier navigation
        let step = SPEED_STEP;
        if (this.speedMultiplier >= 100) step = 50;
        else if (this.speedMultiplier >= 10) step = 5;

        this.speedMultiplier = Math.min(
            MAX_SPEED_MULTIPLIER,
            this.speedMultiplier + step
        );
    }

    private decreaseSpeed(): void {
        // Use larger steps at higher speeds for easier navigation
        let step = SPEED_STEP;
        if (this.speedMultiplier > 100) step = 50;
        else if (this.speedMultiplier > 10) step = 5;

        this.speedMultiplier = Math.max(
            MIN_SPEED_MULTIPLIER,
            this.speedMultiplier - step
        );
    }

    private toggleAIMode(): void {
        this.aiMode = !this.aiMode;

        if (this.aiMode && !this.ai) {
            // Initialize AI if it doesn't exist
            this.loadAI();
        }

        if (this.aiMode && this.ai) {
            // Start auto-restart when AI dies
            this.startAITraining();
        } else {
            this.stopAITraining();
        }
    }

    private loadAI(): void {
        const saved = this.aiStorage.loadSync();
        if (saved) {
            this.ai = new SnakeAI(saved.weights.network, saved.weights.target);
            this.ai.setStats({
                gamesPlayed: saved.gamesPlayed,
                bestScore: saved.bestScore,
                explorationRate: saved.explorationRate,
                scoreHistory: saved.scoreHistory,
                totalScore: saved.totalScore
            });
        } else {
            this.ai = new SnakeAI();
        }
    }

    private saveAI(): void {
        if (!this.ai) return;

        const stats = this.ai.getStats();
        const totalScore = stats.scoreHistory.length > 0
            ? stats.scoreHistory.reduce((sum, score) => sum + score, 0)
            : stats.averageScore * stats.gamesPlayed;

        const saveData: SnakeAISaveData = {
            weights: this.ai.getWeights(),
            gamesPlayed: stats.gamesPlayed,
            bestScore: stats.bestScore,
            explorationRate: stats.explorationRate,
            scoreHistory: stats.scoreHistory,
            totalScore: totalScore,
            version: 2
        };

        this.aiStorage.save(saveData);
    }

    private startAITraining(): void {
        // Auto-save every 10 seconds
        this.saveInterval = window.setInterval(() => {
            this.saveAI();
        }, 10000);
    }

    private stopAITraining(): void {
        if (this.saveInterval !== null) {
            clearInterval(this.saveInterval);
            this.saveInterval = null;
        }
        // Save one last time
        this.saveAI();
    }

    private restartGame(): void {
        // Save AI before restarting
        if (this.ai) {
            this.saveAI();
        }

        this.gameState = this.initializeGame();
        this.lastScore = 0;
        this.lastFoodPosition = null;
        this.lastHeadPosition = null;
        this.lastMoveTime = 0;
        this.gameOverTime = 0;
    }

    public draw(): void {
        if (this.gameState.gameOver) {
            this.drawGameOver();
            return;
        }

        this.drawBackground();
        this.drawFood();
        this.drawSnake();
        this.drawScore();
    }

    private drawBackground(): void {
        // Draw grid background
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid lines
        this.ctx.strokeStyle = '#16213e';
        this.ctx.lineWidth = 1;

        const cellSize = this.gameState.cellSize;
        const offsetX = (this.canvas.width - this.gameState.gridSize * cellSize) / 2;
        const offsetY = (this.canvas.height - this.gameState.gridSize * cellSize) / 2;

        for (let i = 0; i <= this.gameState.gridSize; i++) {
            const x = offsetX + i * cellSize;
            const y = offsetY + i * cellSize;

            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(x, offsetY);
            this.ctx.lineTo(x, offsetY + this.gameState.gridSize * cellSize);
            this.ctx.stroke();

            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX, y);
            this.ctx.lineTo(offsetX + this.gameState.gridSize * cellSize, y);
            this.ctx.stroke();
        }
    }

    private drawSnake(): void {
        const cellSize = this.gameState.cellSize;
        const offsetX = (this.canvas.width - this.gameState.gridSize * cellSize) / 2;
        const offsetY = (this.canvas.height - this.gameState.gridSize * cellSize) / 2;

        this.gameState.snake.forEach((segment, index) => {
            const x = offsetX + segment.x * cellSize;
            const y = offsetY + segment.y * cellSize;

            // Head is slightly different color
            if (index === 0) {
                this.ctx.fillStyle = '#4ade80';
            } else {
                this.ctx.fillStyle = '#22c55e';
            }

            this.ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        });
    }

    private drawFood(): void {
        const cellSize = this.gameState.cellSize;
        const offsetX = (this.canvas.width - this.gameState.gridSize * cellSize) / 2;
        const offsetY = (this.canvas.height - this.gameState.gridSize * cellSize) / 2;

        const x = offsetX + this.gameState.food.x * cellSize;
        const y = offsetY + this.gameState.food.y * cellSize;

        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(
            x + cellSize / 2,
            y + cellSize / 2,
            cellSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    private drawScore(): void {
        this.ctx.fillStyle = 'white';
        this.ctx.font = `${this.canvas.height * 0.03}px sans-serif`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`Score: ${this.gameState.score}`, 10, 10);

        let yOffset = 40;

        // Draw AI info if AI mode is on
        if (this.aiMode && this.ai) {
            const stats = this.ai.getStats();
            const fontSize = this.canvas.height * 0.025;
            this.ctx.font = `${fontSize}px sans-serif`;
            this.ctx.fillStyle = '#60a5fa';
            this.ctx.fillText(`AI Mode: ON`, 10, yOffset);
            yOffset += fontSize;
            this.ctx.fillText(`Games: ${stats.gamesPlayed}`, 10, yOffset);
            yOffset += fontSize;
            this.ctx.fillText(`Best: ${stats.bestScore}`, 10, yOffset);
            yOffset += fontSize;
            this.ctx.fillText(`Press 'A' to toggle AI`, 10, yOffset);
            yOffset += fontSize;
            this.ctx.fillText(`Press 'V' for visualization`, 10, yOffset);
            yOffset += fontSize * 1.5;
        } else if (this.ai) {
            const stats = this.ai.getStats();
            const fontSize = this.canvas.height * 0.02;
            this.ctx.font = `${fontSize}px sans-serif`;
            this.ctx.fillStyle = '#9ca3af';
            this.ctx.fillText(`Press 'A' for AI (Games: ${stats.gamesPlayed}, Best: ${stats.bestScore})`, 10, yOffset);
            yOffset += fontSize * 1.5;
        }

        // Draw speed indicator at bottom left
        const speedFontSize = this.canvas.height * 0.025;
        this.ctx.font = `${speedFontSize}px sans-serif`;
        // Color code: blue for slow, white for normal, yellow for fast, red for very fast
        let speedColor = 'white';
        if (this.speedMultiplier < 1) speedColor = '#60a5fa';
        else if (this.speedMultiplier > 1 && this.speedMultiplier < 10) speedColor = '#fbbf24';
        else if (this.speedMultiplier >= 10) speedColor = '#ef4444';

        this.ctx.fillStyle = speedColor;
        const speedText = `Speed: ${this.speedMultiplier >= 10 ? this.speedMultiplier.toFixed(0) : this.speedMultiplier.toFixed(1)}x`;
        this.ctx.fillText(speedText, 10, this.canvas.height - 50);
        this.ctx.fillStyle = '#9ca3af';
        this.ctx.font = `${speedFontSize * 0.7}px sans-serif`;
        this.ctx.fillText(`+/- to change, 0 to reset (max: ${MAX_SPEED_MULTIPLIER}x)`, 10, this.canvas.height - 30);
    }

    private drawGameOver(): void {
        this.drawBackground();
        this.drawSnake();
        this.drawFood();

        // Dark overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Game over text
        this.ctx.fillStyle = 'white';
        this.ctx.font = `bold ${this.canvas.height * 0.08}px sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2 - 40);

        // Final score
        this.ctx.font = `${this.canvas.height * 0.04}px sans-serif`;
        this.ctx.fillText(`Final Score: ${this.gameState.score}`, this.canvas.width / 2, this.canvas.height / 2);

        // Restart instruction
        this.ctx.font = `${this.canvas.height * 0.025}px sans-serif`;
        this.ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }

    public update(deltaTime: number): void {
        // Recalculate cell size on resize
        const newCellSize = Math.min(this.canvas.width, this.canvas.height) / GRID_SIZE;
        if (Math.abs(newCellSize - this.gameState.cellSize) > 0.1) {
            this.gameState.cellSize = newCellSize;
        }

        // AI control
        if (this.aiMode && this.ai && !this.gameState.gameOver) {
            const aiDirection = this.ai.getAction(this.gameState);
            this.setDirection(aiDirection);
        }

        if (this.gameState.gameOver) {
            // Auto-restart if AI mode is on
            if (this.aiMode && this.ai) {
                // Small delay before restart to see the game over state (adjusted for speed)
                const adjustedDeltaTime = deltaTime * this.speedMultiplier;
                this.gameOverTime += adjustedDeltaTime;
                if (this.gameOverTime >= 500) { // Wait 500ms (at normal speed)
                    this.restartGame();
                }
            }
            return;
        }

        // Apply speed multiplier to deltaTime
        const adjustedDeltaTime = deltaTime * this.speedMultiplier;
        this.lastMoveTime += adjustedDeltaTime;

        if (this.lastMoveTime >= GAME_SPEED_MS) {
            this.lastMoveTime = 0;

            // Capture state before move for AI learning
            if (this.ai && this.aiMode) {
                const decisionInfo = this.ai.getDecisionInfo();
                if (decisionInfo) {
                    this.lastStateBeforeMove = decisionInfo.features;
                    this.lastActionBeforeMove = decisionInfo.selectedAction;
                    // Capture head position before move for distance calculation
                    this.lastHeadPosition = this.gameState.snake.length > 0
                        ? { ...this.gameState.snake[0] }
                        : null;
                }
            }

            this.moveSnake();

            // Update AI rewards after move
            if (this.ai && this.aiMode) {
                this.updateAIRewards();
            }
        }
    }

    private updateAIRewards(): void {
        if (!this.ai || this.lastStateBeforeMove === null || this.lastActionBeforeMove === null) {
            return;
        }

        // Calculate reward with improved shaping focused on food collection
        let reward = -0.05; // Time penalty to discourage endless wandering

        // Reward for eating food
        if (this.gameState.score > this.lastScore) {
            reward = 50.0; // Large positive reward for eating food (increased from 10)
            this.lastScore = this.gameState.score;
        } else if (!this.gameState.gameOver && this.lastHeadPosition) {
            // Distance-based reward: strong guidance toward food
            const head = this.gameState.snake[0];
            const currentDistance = Math.abs(head.x - this.gameState.food.x) + Math.abs(head.y - this.gameState.food.y);
            const previousDistance = Math.abs(this.lastHeadPosition.x - this.gameState.food.x) + Math.abs(this.lastHeadPosition.y - this.gameState.food.y);

            // Stronger distance reward to guide the snake toward food
            const maxDistance = this.gameState.gridSize * 2;
            const distanceChange = previousDistance - currentDistance;
            reward += (distanceChange / maxDistance) * 2.0; // Increased from 0.5 to provide stronger signal
        }

        // Reduced death penalty so AI is willing to take risks for food
        if (this.gameState.gameOver) {
            // Smaller base penalty, encourage the AI to try for food rather than just survive
            reward = -5.0; // Reduced from -(10 + score * 0.5)
        }

        // Capture state after move (for nextState)
        const stateAfterMove = this.gameState.gameOver ? null : this.ai.stateToFeatures(this.gameState);
        const done = this.gameState.gameOver;

        // Store experience in replay buffer
        this.ai.remember(
            this.lastStateBeforeMove,
            this.lastActionBeforeMove,
            reward,
            stateAfterMove,
            done
        );

        // Training now happens at game end, not every step
        // This is handled in SnakeAI.onGameEnd()

        // Clear stored state/action
        this.lastStateBeforeMove = null;
        this.lastActionBeforeMove = null;
        this.lastHeadPosition = null;
        this.lastFoodPosition = { ...this.gameState.food };
    }

    private moveSnake(): void {
        this.gameState.direction = this.gameState.nextDirection;

        const head = this.gameState.snake[0];
        const newHead: Position = { ...head };

        switch (this.gameState.direction) {
            case Direction.UP:
                newHead.y -= 1;
                break;
            case Direction.DOWN:
                newHead.y += 1;
                break;
            case Direction.LEFT:
                newHead.x -= 1;
                break;
            case Direction.RIGHT:
                newHead.x += 1;
                break;
        }

        // Check wall collision
        if (
            newHead.x < 0 ||
            newHead.x >= this.gameState.gridSize ||
            newHead.y < 0 ||
            newHead.y >= this.gameState.gridSize
        ) {
            this.gameState.gameOver = true;
            // Record death penalty for AI (handled in updateAIRewards)
            if (this.ai && this.aiMode) {
                this.ai.onGameEnd(this.gameState.score);
            }
            return;
        }

        // Check self collision
        if (this.gameState.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            this.gameState.gameOver = true;
            // Record death penalty for AI (handled in updateAIRewards)
            if (this.ai && this.aiMode) {
                this.ai.onGameEnd(this.gameState.score);
            }
            return;
        }

        this.gameState.snake.unshift(newHead);

        // Check food collision
        if (newHead.x === this.gameState.food.x && newHead.y === this.gameState.food.y) {
            this.gameState.score += 10;
            this.gameState.food = this.generateFood(this.gameState.snake, this.gameState.gridSize);
            // Food reward is handled in updateAIRewards
        } else {
            // Remove tail if no food eaten
            this.gameState.snake.pop();
        }
    }

    // Public method for AI to get game state (for future ML integration)
    public getGameState(): Readonly<SnakeGameState> {
        return this.gameState;
    }

    // Public method for AI to set direction (for future ML integration)
    public setDirection(direction: Direction): void {
        if (this.gameState.gameOver) return;

        const currentDir = this.gameState.direction;
        if (
            (direction === Direction.UP && currentDir !== Direction.DOWN) ||
            (direction === Direction.DOWN && currentDir !== Direction.UP) ||
            (direction === Direction.LEFT && currentDir !== Direction.RIGHT) ||
            (direction === Direction.RIGHT && currentDir !== Direction.LEFT)
        ) {
            this.gameState.nextDirection = direction;
        }
    }

    // Reset AI learning
    public resetAI(): void {
        if (this.ai) {
            this.ai.reset();
            this.aiStorage.save({
                weights: this.ai.getWeights(),
                gamesPlayed: 0,
                bestScore: 0,
                explorationRate: 0.3,
                scoreHistory: [],
                totalScore: 0,
                version: 2
            });
        }
    }

    // Overlay for AI visualization - always returns component, component handles visibility
    public get overlay(): JSX.Element | undefined {
        if (!this.ai) {
            return undefined;
        }
        return createAIVisualizationOverlay(
            () => this.ai,
            () => this.aiMode,
            () => this.showVisualization,
            (visible: boolean) => { this.showVisualization = visible; },
            () => { this.resetAI(); }
        );
    }
}

