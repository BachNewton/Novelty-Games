import { GameWorld } from "../GameWorld";

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

export class SnakeWorld implements GameWorld {
    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;

    private gameState: SnakeGameState;
    private lastMoveTime: number = 0;
    private pressedKeys: Set<string> = new Set();
    private keyDownHandler: ((e: KeyboardEvent) => void) | null = null;
    private keyUpHandler: ((e: KeyboardEvent) => void) | null = null;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gameState = this.initializeGame();
        this.setupKeyboardListeners();
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
    }

    private handleKeyPress(keyCode: string): void {
        if (this.gameState.gameOver) {
            if (keyCode === 'Space') {
                this.gameState = this.initializeGame();
            }
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

        if (this.gameState.gameOver) {
            return;
        }

        this.lastMoveTime += deltaTime;

        if (this.lastMoveTime >= GAME_SPEED_MS) {
            this.lastMoveTime = 0;
            this.moveSnake();
        }
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
            return;
        }

        // Check self collision
        if (this.gameState.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            this.gameState.gameOver = true;
            return;
        }

        this.gameState.snake.unshift(newHead);

        // Check food collision
        if (newHead.x === this.gameState.food.x && newHead.y === this.gameState.food.y) {
            this.gameState.score += 10;
            this.gameState.food = this.generateFood(this.gameState.snake, this.gameState.gridSize);
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
}

