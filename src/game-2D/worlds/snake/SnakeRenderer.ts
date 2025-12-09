// Snake game rendering logic

import { SnakeGameState, MAX_SPEED_MULTIPLIER } from './types';
import { SnakeAI } from './SnakeAI';

export interface RenderContext {
    gameState: SnakeGameState;
    aiMode: boolean;
    ai: SnakeAI | null;
    speedMultiplier: number;
    headlessMode: boolean;
    isPlayingPreview: boolean;
}

export class SnakeRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
    }

    draw(context: RenderContext): void {
        const { gameState, headlessMode, isPlayingPreview } = context;

        // In headless mode, skip rendering unless playing a preview
        if (headlessMode && !isPlayingPreview) {
            this.drawHeadlessStatus(context);
            return;
        }

        if (gameState.gameOver) {
            this.drawGameOver(context);
            return;
        }

        this.drawBackground(gameState);
        this.drawFood(gameState);
        this.drawSnake(gameState);
        this.drawScore(context);
    }

    private drawBackground(gameState: SnakeGameState): void {
        // Draw grid background
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid lines
        this.ctx.strokeStyle = '#16213e';
        this.ctx.lineWidth = 1;

        const cellSize = gameState.cellSize;
        const offsetX = (this.canvas.width - gameState.gridSize * cellSize) / 2;
        const offsetY = (this.canvas.height - gameState.gridSize * cellSize) / 2;

        for (let i = 0; i <= gameState.gridSize; i++) {
            const x = offsetX + i * cellSize;
            const y = offsetY + i * cellSize;

            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(x, offsetY);
            this.ctx.lineTo(x, offsetY + gameState.gridSize * cellSize);
            this.ctx.stroke();

            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX, y);
            this.ctx.lineTo(offsetX + gameState.gridSize * cellSize, y);
            this.ctx.stroke();
        }
    }

    private drawSnake(gameState: SnakeGameState): void {
        const cellSize = gameState.cellSize;
        const offsetX = (this.canvas.width - gameState.gridSize * cellSize) / 2;
        const offsetY = (this.canvas.height - gameState.gridSize * cellSize) / 2;

        gameState.snake.forEach((segment, index) => {
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

    private drawFood(gameState: SnakeGameState): void {
        const cellSize = gameState.cellSize;
        const offsetX = (this.canvas.width - gameState.gridSize * cellSize) / 2;
        const offsetY = (this.canvas.height - gameState.gridSize * cellSize) / 2;

        const x = offsetX + gameState.food.x * cellSize;
        const y = offsetY + gameState.food.y * cellSize;

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

    private drawScore(context: RenderContext): void {
        const { gameState, aiMode, ai, headlessMode, isPlayingPreview, speedMultiplier } = context;

        this.ctx.fillStyle = 'white';
        this.ctx.font = `${this.canvas.height * 0.03}px sans-serif`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`Score: ${gameState.score}`, 10, 10);

        let yOffset = 40;

        // Draw preview banner if in preview mode
        if (isPlayingPreview) {
            const bannerHeight = this.canvas.height * 0.08;
            this.ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
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
        if (aiMode && ai) {
            const stats = ai.getStats();
            const fontSize = this.canvas.height * 0.025;
            this.ctx.font = `${fontSize}px sans-serif`;
            this.ctx.fillStyle = '#60a5fa';
            this.ctx.fillText(`AI Mode: ON ${headlessMode ? '(Headless)' : ''}`, 10, yOffset);
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
        } else if (ai) {
            const stats = ai.getStats();
            const fontSize = this.canvas.height * 0.02;
            this.ctx.font = `${fontSize}px sans-serif`;
            this.ctx.fillStyle = '#9ca3af';
            this.ctx.fillText(`Press 'A' for AI (Games: ${stats.gamesPlayed}, Best: ${stats.bestScore})`, 10, yOffset);
            yOffset += fontSize * 1.5;
        }

        // Draw speed indicator at bottom left
        const speedFontSize = this.canvas.height * 0.025;
        this.ctx.font = `${speedFontSize}px sans-serif`;

        let speedColor = 'white';
        if (speedMultiplier < 1) speedColor = '#60a5fa';
        else if (speedMultiplier > 1 && speedMultiplier < 10) speedColor = '#fbbf24';
        else if (speedMultiplier >= 10) speedColor = '#ef4444';

        this.ctx.fillStyle = speedColor;
        const speedText = `Speed: ${speedMultiplier >= 10 ? speedMultiplier.toFixed(0) : speedMultiplier.toFixed(1)}x`;
        this.ctx.fillText(speedText, 10, this.canvas.height - 50);
        this.ctx.fillStyle = '#9ca3af';
        this.ctx.font = `${speedFontSize * 0.7}px sans-serif`;
        this.ctx.fillText(`+/- to change, 0 to reset (max: ${MAX_SPEED_MULTIPLIER}x)`, 10, this.canvas.height - 30);
    }

    private drawHeadlessStatus(context: RenderContext): void {
        const { ai } = context;

        // Clear canvas
        this.ctx.fillStyle = '#0f0f23';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (!ai) return;

        const stats = ai.getStats();

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

    private drawGameOver(context: RenderContext): void {
        const { gameState } = context;

        this.drawBackground(gameState);
        this.drawSnake(gameState);
        this.drawFood(gameState);

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
        this.ctx.fillText(`Final Score: ${gameState.score}`, this.canvas.width / 2, this.canvas.height / 2);

        // Restart instruction
        this.ctx.font = `${this.canvas.height * 0.025}px sans-serif`;
        this.ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
}
