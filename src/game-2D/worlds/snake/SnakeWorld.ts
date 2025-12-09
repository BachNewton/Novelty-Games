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

    // Headless training mode
    private headlessMode: boolean = false;
    private isPlayingPreview: boolean = false;
    private previewMoveHistory: Direction[] = [];
    private previewInitialState: SnakeGameState | null = null; // Store initial state for replay
    private previewPlaybackIndex: number = 0;
    private lastPreviewScore: number = 0;
    private headlessTrainingHandle: number | null = null;
    private headlessStepsPerFrame: number = 100; // Process 100 game steps per animation frame in headless mode

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
        this.stopHeadlessTraining();
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

        // Toggle headless mode with 'H' key (only in AI mode)
        if (keyCode === 'KeyH' || keyCode === 'Keyh') {
            if (this.aiMode) {
                this.headlessMode = !this.headlessMode;
                if (this.headlessMode) {
                    // Start headless training loop
                    this.startHeadlessTraining();
                } else {
                    // Stop headless training
                    this.stopHeadlessTraining();
                    // When exiting headless mode, stop any preview
                    this.isPlayingPreview = false;
                    this.previewMoveHistory = [];
                }
            }
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

    private startHeadlessTraining(): void {
        // Headless training runs in a separate loop for maximum speed
        // We'll process multiple game steps per animation frame
        const runTrainingStep = () => {
            if (!this.headlessMode || this.isPlayingPreview) {
                return; // Exit if headless mode disabled or playing preview
            }

            // Run multiple game steps per frame for maximum speed
            for (let i = 0; i < this.headlessStepsPerFrame; i++) {
                this.processGameStep();

                // If we need to show a preview, break out
                if (this.isPlayingPreview) {
                    break;
                }
            }

            // Continue the loop
            this.headlessTrainingHandle = requestAnimationFrame(runTrainingStep);
        };

        // Start the training loop
        this.headlessTrainingHandle = requestAnimationFrame(runTrainingStep);
    }

    private stopHeadlessTraining(): void {
        if (this.headlessTrainingHandle !== null) {
            cancelAnimationFrame(this.headlessTrainingHandle);
            this.headlessTrainingHandle = null;
        }
    }

    private startPreview(): void {
        // Pause headless training during preview
        this.stopHeadlessTraining();

        // Reset the game to replay the recorded moves
        this.isPlayingPreview = true;
        this.previewPlaybackIndex = 0;

        console.log(`[PREVIEW] Starting preview with ${this.previewMoveHistory.length} moves recorded`);

        this.restartGame();

        // Preview will run through normal update() loop at visible speed
    }

    private restartGame(): void {
        // Save AI before restarting
        if (this.ai) {
            this.saveAI();
        }

        // If we're starting a preview replay, restore the saved initial state
        if (this.isPlayingPreview && this.previewInitialState) {
            // Deep copy the saved state to avoid mutations
            this.gameState = {
                ...this.previewInitialState,
                snake: this.previewInitialState.snake.map(pos => ({ ...pos })),
                food: { ...this.previewInitialState.food }
            };
        } else {
            this.gameState = this.initializeGame();

            // If in headless mode, save the initial state for potential preview
            if (this.headlessMode) {
                this.previewInitialState = {
                    ...this.gameState,
                    snake: this.gameState.snake.map(pos => ({ ...pos })),
                    food: { ...this.gameState.food }
                };
            }
        }

        this.lastScore = 0;
        this.lastFoodPosition = null;
        this.lastHeadPosition = null;
        this.lastMoveTime = 0;
        this.gameOverTime = 0;

        // Clear move history when starting a NEW game (not when starting a preview replay)
        // This ensures we only record moves from the current game, not accumulate across games
        if (this.headlessMode && !this.isPlayingPreview) {
            this.previewMoveHistory = [];
            this.previewPlaybackIndex = 0;
        } else if (!this.isPlayingPreview) {
            // In normal (non-headless) mode, always clear
            this.previewMoveHistory = [];
            this.previewPlaybackIndex = 0;
        }
    }

    public draw(): void {
        // In headless mode, skip rendering unless playing a preview
        if (this.headlessMode && !this.isPlayingPreview) {
            // Draw headless status screen
            this.drawHeadlessStatus();
            return;
        }

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

        // Draw preview banner if in preview mode
        if (this.isPlayingPreview) {
            const bannerHeight = this.canvas.height * 0.08;
            this.ctx.fillStyle = 'rgba(251, 191, 36, 0.9)'; // Yellow banner
            this.ctx.fillRect(0, 0, this.canvas.width, bannerHeight);
            this.ctx.fillStyle = '#000';
            this.ctx.font = `bold ${bannerHeight * 0.4}px sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('PREVIEW REPLAY', this.canvas.width / 2, bannerHeight / 2);
            this.ctx.textAlign = 'left';
            yOffset = bannerHeight + 10;
        }

        // Draw AI info if AI mode is on
        if (this.aiMode && this.ai) {
            const stats = this.ai.getStats();
            const fontSize = this.canvas.height * 0.025;
            this.ctx.font = `${fontSize}px sans-serif`;
            this.ctx.fillStyle = '#60a5fa';
            this.ctx.fillText(`AI Mode: ON ${this.headlessMode ? '(Headless)' : ''}`, 10, yOffset);
            yOffset += fontSize;
            this.ctx.fillText(`Games: ${stats.gamesPlayed}`, 10, yOffset);
            yOffset += fontSize;
            this.ctx.fillText(`Best: ${stats.bestScore}`, 10, yOffset);
            yOffset += fontSize;
            this.ctx.fillText(`Press 'A' to toggle AI`, 10, yOffset);
            yOffset += fontSize;
            this.ctx.fillText(`Press 'H' for headless mode`, 10, yOffset);
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

    private drawHeadlessStatus(): void {
        // Clear canvas
        this.ctx.fillStyle = '#0f0f23';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.ai) return;

        const stats = this.ai.getStats();

        // Title
        this.ctx.fillStyle = '#60a5fa';
        this.ctx.font = `bold ${this.canvas.height * 0.06}px sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('HEADLESS TRAINING MODE', this.canvas.width / 2, this.canvas.height * 0.15);

        // Stats
        const fontSize = this.canvas.height * 0.04;
        this.ctx.font = `${fontSize}px sans-serif`;
        this.ctx.fillStyle = 'white';

        let y = this.canvas.height * 0.35;
        this.ctx.fillText(`Games Played: ${stats.gamesPlayed}`, this.canvas.width / 2, y);
        y += fontSize * 1.5;
        this.ctx.fillText(`Best Score: ${stats.bestScore}`, this.canvas.width / 2, y);
        y += fontSize * 1.5;
        this.ctx.fillText(`Avg Score: ${stats.averageScore.toFixed(1)}`, this.canvas.width / 2, y);
        y += fontSize * 1.5;
        this.ctx.fillText(`Exploration: ${(stats.explorationRate * 100).toFixed(1)}%`, this.canvas.width / 2, y);
        y += fontSize * 1.5;

        // Show info about preview behavior
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.fillText(`Preview on new high score`, this.canvas.width / 2, y);

        // Instructions
        this.ctx.font = `${fontSize * 0.6}px sans-serif`;
        this.ctx.fillStyle = '#9ca3af';
        this.ctx.fillText(`Press 'H' to exit headless mode`, this.canvas.width / 2, this.canvas.height * 0.85);
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

    // Process a single game step (used by both normal and headless modes)
    private processGameStep(): void {
        // AI control
        if (this.aiMode && this.ai && !this.gameState.gameOver) {
            let aiDirection: Direction;

            // During preview playback, use recorded moves
            if (this.isPlayingPreview && this.previewPlaybackIndex < this.previewMoveHistory.length) {
                aiDirection = this.previewMoveHistory[this.previewPlaybackIndex];
                this.previewPlaybackIndex++;
            } else {
                // Normal AI decision-making
                aiDirection = this.ai.getAction(this.gameState);

                // Record moves in headless mode (but not during playback)
                if (this.headlessMode && !this.isPlayingPreview) {
                    this.previewMoveHistory.push(aiDirection);
                }
            }

            this.setDirection(aiDirection);
        }

        if (this.gameState.gameOver) {
            // Handle game end
            if (this.aiMode && this.ai) {
                // If we were playing a preview, it's done - resume headless training
                if (this.isPlayingPreview) {
                    console.log(`[PREVIEW] Preview ended, resuming headless training`);
                    this.isPlayingPreview = false;
                    this.previewMoveHistory = [];
                    this.previewPlaybackIndex = 0;

                    // Resume headless training after preview
                    if (this.headlessMode) {
                        this.startHeadlessTraining();
                    }
                    this.restartGame();
                    return;
                }

                // NOT in a preview - check if we should show one
                // Capture scores to check if THIS game achieved a new high score
                const currentScore = this.gameState.score;
                const oldBestScore = this.ai.getStats().bestScore;

                // Check if we should show a preview
                const shouldShowPreview = this.headlessMode &&
                    currentScore > oldBestScore &&
                    currentScore > this.lastPreviewScore;

                if (shouldShowPreview) {
                    this.lastPreviewScore = currentScore;
                    console.log(`[PREVIEW] New high score! Current: ${currentScore}, Old Best: ${oldBestScore}, Moves recorded: ${this.previewMoveHistory.length}`);
                }

                // In headless mode, restart immediately or start preview
                if (shouldShowPreview && this.previewMoveHistory.length > 0) {
                    this.startPreview();
                } else {
                    this.restartGame();
                }
            }
            return;
        }

        // Capture the old best score BEFORE the move (in case the move causes game over)
        const oldBestScoreBeforeMove = this.ai ? this.ai.getStats().bestScore : 0;

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

        // After the move, check if the game just ended with a new high score
        // This catches the case where moveSnake() caused game over and called onGameEnd()
        if (this.gameState.gameOver && this.ai && this.headlessMode && !this.isPlayingPreview) {
            const currentScore = this.gameState.score;
            const newBestScore = this.ai.getStats().bestScore;

            // If bestScore changed and it's greater than last preview score, show preview
            if (newBestScore > oldBestScoreBeforeMove && currentScore > this.lastPreviewScore) {
                this.lastPreviewScore = currentScore;
                console.log(`[PREVIEW] New high score detected after move! Current: ${currentScore}, Old Best: ${oldBestScoreBeforeMove}, New Best: ${newBestScore}, Moves recorded: ${this.previewMoveHistory.length}`);

                // Start preview
                if (this.previewMoveHistory.length > 0) {
                    this.startPreview();
                    return;
                }
            }
        }
    }

    public update(deltaTime: number): void {
        // Recalculate cell size on resize
        const newCellSize = Math.min(this.canvas.width, this.canvas.height) / GRID_SIZE;
        if (Math.abs(newCellSize - this.gameState.cellSize) > 0.1) {
            this.gameState.cellSize = newCellSize;
        }

        // In headless mode (not preview), the game logic runs in its own loop
        // Only process updates for preview mode or normal mode
        if (this.headlessMode && !this.isPlayingPreview) {
            return; // Headless training handled by separate loop
        }

        // Handle game over delay for preview mode
        if (this.gameState.gameOver && this.isPlayingPreview) {
            const adjustedDeltaTime = deltaTime * this.speedMultiplier;
            this.gameOverTime += adjustedDeltaTime;

            if (this.gameOverTime >= 500) {
                this.gameOverTime = 0;
                this.processGameStep();
            }
            return;
        }

        // Apply speed multiplier to deltaTime
        const adjustedDeltaTime = deltaTime * this.speedMultiplier;
        this.lastMoveTime += adjustedDeltaTime;

        if (this.lastMoveTime >= GAME_SPEED_MS) {
            this.lastMoveTime = 0;
            this.processGameStep();
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

