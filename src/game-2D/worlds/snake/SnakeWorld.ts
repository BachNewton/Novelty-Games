import { GameWorld } from "../GameWorld";
import { deserializeWeights, serializeWeights } from "./NeuralNetwork";
import { SnakeAI } from "./SnakeAI";
import { createSnakeAIStorage, SnakeAISaveData } from "./SnakeAIStorage";
import { createAIVisualizationOverlay } from "./ui/AIVisualization";
import { Direction, Position, SnakeGameState, GAME_SPEED_MS } from "./types";
import { SnakeGame, FoodGenerator, RandomFoodGenerator } from "./SnakeGame";
import { SnakeRenderer, RenderContext } from "./SnakeRenderer";
import { SnakeInput, InputCallbacks } from "./SnakeInput";

// Re-export types for backward compatibility
export { Direction } from "./types";
export type { Position, SnakeGameState } from "./types";

// Food generator that records positions for replay
class RecordingFoodGenerator implements FoodGenerator {
    private history: Position[] = [];
    private baseGenerator = new RandomFoodGenerator();

    generateFood(snake: Position[], gridSize: number): Position {
        const food = this.baseGenerator.generateFood(snake, gridSize);
        this.history.push({ ...food });
        return food;
    }

    getHistory(): Position[] {
        return [...this.history];
    }

    clear(): void {
        this.history = [];
    }
}

// Food generator that replays recorded positions
class ReplayFoodGenerator implements FoodGenerator {
    private history: Position[];
    private index: number = 0;
    private baseGenerator = new RandomFoodGenerator();

    constructor(history: Position[]) {
        this.history = history;
    }

    generateFood(snake: Position[], gridSize: number): Position {
        if (this.index < this.history.length) {
            return { ...this.history[this.index++] };
        }
        return this.baseGenerator.generateFood(snake, gridSize);
    }

    reset(): void {
        this.index = 0;
    }
}

export class SnakeWorld implements GameWorld {
    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;

    // Core components
    private game: SnakeGame;
    private renderer: SnakeRenderer;
    private input: SnakeInput;

    // Game timing
    private lastMoveTime: number = 0;
    private gameOverTime: number = 0;
    private speedMultiplier: number = 1.0;

    // AI components
    private ai: SnakeAI | null = null;
    private aiMode: boolean = false;
    private aiStorage = createSnakeAIStorage();
    private saveInterval: number | null = null;
    private showVisualization: boolean = false;

    // AI learning state
    private lastScore: number = 0;
    private lastHeadPosition: Position | null = null;
    private lastStateBeforeMove: number[] | null = null;
    private lastActionBeforeMove: number | null = null;

    // Headless training state
    private headlessMode: boolean = false;
    private isPlayingPreview: boolean = false;
    private headlessTrainingHandle: number | null = null;
    private headlessStepsPerFrame: number = 100;

    // Preview replay state
    private previewMoveHistory: Direction[] = [];
    private previewFoodHistory: Position[] = [];
    private previewPlaybackIndex: number = 0;
    private previewFoodIndex: number = 0;
    private previewInitialState: SnakeGameState | null = null;
    private lastPreviewScore: number = 0;
    private recordingFoodGenerator: RecordingFoodGenerator;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.recordingFoodGenerator = new RecordingFoodGenerator();
        this.game = new SnakeGame(canvas.width, canvas.height);
        this.renderer = new SnakeRenderer(canvas, ctx);

        const inputCallbacks: InputCallbacks = {
            onDirectionChange: (dir) => this.game.setDirection(dir),
            onToggleAI: () => this.toggleAIMode(),
            onToggleVisualization: () => { this.showVisualization = !this.showVisualization; },
            onToggleHeadless: () => this.toggleHeadlessMode(),
            onRestart: () => this.restartGame(),
            onSpeedChange: (speed) => { this.speedMultiplier = speed; },
            getCurrentDirection: () => this.game.getState().direction,
            isGameOver: () => this.game.isGameOver(),
            isAIMode: () => this.aiMode
        };
        this.input = new SnakeInput(inputCallbacks);

        this.loadAI();
    }

    public cleanup(): void {
        this.input.cleanup();
        this.stopAITraining();
        this.stopHeadlessTraining();
    }

    private toggleAIMode(): void {
        this.aiMode = !this.aiMode;

        if (this.aiMode && !this.ai) {
            this.loadAI();
        }

        if (this.aiMode && this.ai) {
            this.startAITraining();
        } else {
            this.stopAITraining();
        }
    }

    private toggleHeadlessMode(): void {
        if (!this.aiMode) return;

        this.headlessMode = !this.headlessMode;
        if (this.headlessMode) {
            this.startHeadlessTraining();
        } else {
            this.stopHeadlessTraining();
            this.isPlayingPreview = false;
            this.clearRecording();
        }
    }

    private loadAI(): void {
        const saved = this.aiStorage.loadSync();
        if (saved) {
            const networkWeights = deserializeWeights(saved.weights.network);
            const targetWeights = deserializeWeights(saved.weights.target);
            this.ai = new SnakeAI(networkWeights, targetWeights);
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

        const weights = this.ai.getWeights();
        const saveData: SnakeAISaveData = {
            weights: {
                network: serializeWeights(weights.network),
                target: serializeWeights(weights.target)
            },
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
        this.saveInterval = window.setInterval(() => {
            this.saveAI();
        }, 10000);
    }

    private stopAITraining(): void {
        if (this.saveInterval !== null) {
            clearInterval(this.saveInterval);
            this.saveInterval = null;
        }
        this.saveAI();
    }

    private startHeadlessTraining(): void {
        // Use recording food generator
        this.game.setFoodGenerator(this.recordingFoodGenerator);
        this.previewInitialState = this.game.cloneState();

        const runTrainingStep = () => {
            if (!this.headlessMode || this.isPlayingPreview) {
                return;
            }

            for (let i = 0; i < this.headlessStepsPerFrame; i++) {
                this.processGameStep();

                if (this.isPlayingPreview) {
                    break;
                }
            }

            this.headlessTrainingHandle = requestAnimationFrame(runTrainingStep);
        };

        this.headlessTrainingHandle = requestAnimationFrame(runTrainingStep);
    }

    private stopHeadlessTraining(): void {
        if (this.headlessTrainingHandle !== null) {
            cancelAnimationFrame(this.headlessTrainingHandle);
            this.headlessTrainingHandle = null;
        }
    }

    private startPreview(): void {
        this.stopHeadlessTraining();

        this.isPlayingPreview = true;
        this.previewPlaybackIndex = 0;
        this.previewFoodIndex = 0;

        // Set up replay food generator
        const replayGenerator = new ReplayFoodGenerator(this.previewFoodHistory);
        this.game.setFoodGenerator(replayGenerator);

        // Restore initial state
        if (this.previewInitialState) {
            this.game.resetWithState(this.previewInitialState);
        }
    }

    private clearRecording(): void {
        this.previewMoveHistory = [];
        this.previewPlaybackIndex = 0;
        this.previewFoodHistory = [];
        this.previewFoodIndex = 0;
        this.recordingFoodGenerator.clear();
    }

    private restartGame(): void {
        if (this.ai) {
            this.saveAI();
        }

        if (this.isPlayingPreview && this.previewInitialState) {
            this.game.resetWithState(this.previewInitialState);
        } else {
            this.game.reset(this.canvas.width, this.canvas.height);

            if (this.headlessMode) {
                this.previewInitialState = this.game.cloneState();
            }
        }

        this.lastScore = 0;
        this.lastHeadPosition = null;
        this.lastMoveTime = 0;
        this.gameOverTime = 0;

        if (this.headlessMode && !this.isPlayingPreview) {
            this.clearRecording();
            this.previewFoodHistory = [];
        } else if (!this.isPlayingPreview) {
            this.clearRecording();
        }
    }

    public draw(): void {
        const renderContext: RenderContext = {
            gameState: this.game.getState() as SnakeGameState,
            aiMode: this.aiMode,
            ai: this.ai,
            speedMultiplier: this.speedMultiplier,
            headlessMode: this.headlessMode,
            isPlayingPreview: this.isPlayingPreview
        };

        this.renderer.draw(renderContext);
    }

    private processGameStep(): void {
        const gameState = this.game.getState();

        // AI control
        if (this.aiMode && this.ai && !gameState.gameOver) {
            let aiDirection: Direction;

            if (this.isPlayingPreview && this.previewPlaybackIndex < this.previewMoveHistory.length) {
                aiDirection = this.previewMoveHistory[this.previewPlaybackIndex];
                this.previewPlaybackIndex++;
            } else {
                aiDirection = this.ai.getAction(gameState);

                if (this.headlessMode && !this.isPlayingPreview) {
                    this.previewMoveHistory.push(aiDirection);
                }
            }

            this.game.setDirection(aiDirection);
        }

        if (gameState.gameOver) {
            this.handleGameOver();
            return;
        }

        const oldBestScoreBeforeMove = this.ai ? this.ai.getStats().bestScore : 0;

        // Capture state before move for AI learning
        if (this.ai && this.aiMode) {
            const decisionInfo = this.ai.getDecisionInfo();
            if (decisionInfo) {
                this.lastStateBeforeMove = decisionInfo.features;
                this.lastActionBeforeMove = decisionInfo.selectedAction;
                this.lastHeadPosition = gameState.snake.length > 0
                    ? { ...gameState.snake[0] }
                    : null;
            }
        }

        // Record food position before move (for replay)
        if (this.headlessMode && !this.isPlayingPreview) {
            // Food history is recorded by the RecordingFoodGenerator
        }

        this.game.move();

        // Update AI rewards after move
        if (this.ai && this.aiMode) {
            this.updateAIRewards();
        }

        // Check if game ended with new high score
        if (this.game.isGameOver() && this.ai && this.headlessMode && !this.isPlayingPreview) {
            const currentScore = this.game.getScore();
            const newBestScore = this.ai.getStats().bestScore;

            if (newBestScore > oldBestScoreBeforeMove && currentScore > this.lastPreviewScore) {
                this.lastPreviewScore = currentScore;
                this.previewFoodHistory = this.recordingFoodGenerator.getHistory();

                if (this.previewMoveHistory.length > 0) {
                    this.startPreview();
                    return;
                }
            }
        }
    }

    private handleGameOver(): void {
        if (this.aiMode && this.ai) {
            if (this.isPlayingPreview) {
                this.isPlayingPreview = false;
                this.clearRecording();

                if (this.headlessMode) {
                    this.game.setFoodGenerator(this.recordingFoodGenerator);
                    this.startHeadlessTraining();
                }
                this.restartGame();
                return;
            }

            const currentScore = this.game.getScore();
            const oldBestScore = this.ai.getStats().bestScore;

            const shouldShowPreview = this.headlessMode &&
                currentScore > oldBestScore &&
                currentScore > this.lastPreviewScore;

            if (shouldShowPreview) {
                this.lastPreviewScore = currentScore;
                this.previewFoodHistory = this.recordingFoodGenerator.getHistory();
            }

            if (shouldShowPreview && this.previewMoveHistory.length > 0) {
                this.startPreview();
            } else {
                this.restartGame();
            }
        }
    }

    public update(deltaTime: number): void {
        this.game.updateCellSize(this.canvas.width, this.canvas.height);

        if (this.headlessMode && !this.isPlayingPreview) {
            return;
        }

        if (this.game.isGameOver() && this.isPlayingPreview) {
            const adjustedDeltaTime = deltaTime * this.speedMultiplier;
            this.gameOverTime += adjustedDeltaTime;

            if (this.gameOverTime >= 500) {
                this.gameOverTime = 0;
                this.processGameStep();
            }
            return;
        }

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

        const gameState = this.game.getState();
        let reward = -0.05; // Time penalty

        if (gameState.score > this.lastScore) {
            reward = 50.0;
            this.lastScore = gameState.score;
        } else if (!gameState.gameOver && this.lastHeadPosition) {
            const head = gameState.snake[0];
            const currentDistance = Math.abs(head.x - gameState.food.x) + Math.abs(head.y - gameState.food.y);
            const previousDistance = Math.abs(this.lastHeadPosition.x - gameState.food.x) + Math.abs(this.lastHeadPosition.y - gameState.food.y);

            const maxDistance = gameState.gridSize * 2;
            const distanceChange = previousDistance - currentDistance;
            reward += (distanceChange / maxDistance) * 2.0;
        }

        if (gameState.gameOver) {
            reward = -5.0;
            this.ai.onGameEnd(gameState.score);
        }

        const stateAfterMove = gameState.gameOver ? null : this.ai.stateToFeatures(gameState);
        const done = gameState.gameOver;

        this.ai.remember(
            this.lastStateBeforeMove,
            this.lastActionBeforeMove,
            reward,
            stateAfterMove,
            done
        );

        this.lastStateBeforeMove = null;
        this.lastActionBeforeMove = null;
        this.lastHeadPosition = null;
    }

    public getGameState(): Readonly<SnakeGameState> {
        return this.game.getState();
    }

    public setDirection(direction: Direction): void {
        this.game.setDirection(direction);
    }

    public resetAI(): void {
        if (this.ai) {
            this.ai.reset();
            const weights = this.ai.getWeights();
            this.aiStorage.save({
                weights: {
                    network: serializeWeights(weights.network),
                    target: serializeWeights(weights.target)
                },
                gamesPlayed: 0,
                bestScore: 0,
                explorationRate: 0.3,
                scoreHistory: [],
                totalScore: 0,
                version: 2
            });
        }
    }

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
