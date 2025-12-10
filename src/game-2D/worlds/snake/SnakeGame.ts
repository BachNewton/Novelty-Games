// Core snake game logic - handles state, movement, collision, and food generation

import {
    Direction,
    Position,
    SnakeGameState,
    GRID_SIZE,
    INITIAL_SNAKE_LENGTH,
    POINTS_PER_FOOD
} from './types';

export interface FoodGenerator {
    generateFood(snake: Position[], gridSize: number): Position;
}

// Default random food generator
export class RandomFoodGenerator implements FoodGenerator {
    generateFood(snake: Position[], gridSize: number): Position {
        let food: Position;
        let isOnSnake: boolean;
        do {
            food = {
                x: Math.floor(Math.random() * gridSize),
                y: Math.floor(Math.random() * gridSize)
            };
            const checkFood = food;
            isOnSnake = snake.some(segment => segment.x === checkFood.x && segment.y === checkFood.y);
        } while (isOnSnake);
        return food;
    }
}

export class SnakeGame {
    private state: SnakeGameState;
    private foodGenerator: FoodGenerator;
    private onFoodEaten?: () => void;

    constructor(
        canvasWidth: number,
        canvasHeight: number,
        foodGenerator?: FoodGenerator
    ) {
        this.foodGenerator = foodGenerator ?? new RandomFoodGenerator();
        this.state = this.createInitialState(canvasWidth, canvasHeight);
    }

    private createInitialState(canvasWidth: number, canvasHeight: number): SnakeGameState {
        const gridSize = GRID_SIZE;
        const cellSize = Math.min(canvasWidth, canvasHeight) / gridSize;

        // Start snake in the middle, facing right
        const startX = Math.floor(gridSize / 2);
        const startY = Math.floor(gridSize / 2);
        const snake: Position[] = [];

        for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
            snake.push({ x: startX - i, y: startY });
        }

        return {
            snake,
            food: this.foodGenerator.generateFood(snake, gridSize),
            direction: Direction.RIGHT,
            nextDirection: Direction.RIGHT,
            score: 0,
            gameOver: false,
            gridSize,
            cellSize
        };
    }

    // Get a readonly view of the current game state
    getState(): Readonly<SnakeGameState> {
        return this.state;
    }

    // Update cell size when canvas resizes
    updateCellSize(canvasWidth: number, canvasHeight: number): void {
        const newCellSize = Math.min(canvasWidth, canvasHeight) / GRID_SIZE;
        if (Math.abs(newCellSize - this.state.cellSize) > 0.1) {
            this.state.cellSize = newCellSize;
        }
    }

    // Set the food generator (allows switching between random and replay modes)
    setFoodGenerator(generator: FoodGenerator): void {
        this.foodGenerator = generator;
    }

    // Set callback for when food is eaten
    setOnFoodEaten(callback: () => void): void {
        this.onFoodEaten = callback;
    }

    // Try to set a new direction (validates against 180-degree turns)
    setDirection(direction: Direction): boolean {
        if (this.state.gameOver) return false;

        const currentDir = this.state.direction;
        const isValid =
            (direction === Direction.UP && currentDir !== Direction.DOWN) ||
            (direction === Direction.DOWN && currentDir !== Direction.UP) ||
            (direction === Direction.LEFT && currentDir !== Direction.RIGHT) ||
            (direction === Direction.RIGHT && currentDir !== Direction.LEFT);

        if (isValid) {
            this.state.nextDirection = direction;
            return true;
        }
        return false;
    }

    // Execute one game step - returns true if snake ate food
    move(): boolean {
        if (this.state.gameOver) return false;

        this.state.direction = this.state.nextDirection;

        const head = this.state.snake[0];
        const newHead: Position = { ...head };

        switch (this.state.direction) {
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
        if (this.isOutOfBounds(newHead)) {
            this.state.gameOver = true;
            return false;
        }

        // Check self collision
        if (this.collidesWithSnake(newHead)) {
            this.state.gameOver = true;
            return false;
        }

        this.state.snake.unshift(newHead);

        // Check food collision
        if (newHead.x === this.state.food.x && newHead.y === this.state.food.y) {
            this.state.score += POINTS_PER_FOOD;
            this.state.food = this.foodGenerator.generateFood(this.state.snake, this.state.gridSize);
            this.onFoodEaten?.();
            return true;
        } else {
            this.state.snake.pop();
            return false;
        }
    }

    private isOutOfBounds(pos: Position): boolean {
        return pos.x < 0 ||
               pos.x >= this.state.gridSize ||
               pos.y < 0 ||
               pos.y >= this.state.gridSize;
    }

    private collidesWithSnake(pos: Position): boolean {
        return this.state.snake.some(
            segment => segment.x === pos.x && segment.y === pos.y
        );
    }

    // Reset the game to initial state
    reset(canvasWidth: number, canvasHeight: number): void {
        this.state = this.createInitialState(canvasWidth, canvasHeight);
    }

    // Reset with a specific initial state (for replays)
    resetWithState(state: SnakeGameState): void {
        this.state = {
            ...state,
            snake: state.snake.map(pos => ({ ...pos })),
            food: { ...state.food }
        };
    }

    // Get a deep copy of current state (for saving)
    cloneState(): SnakeGameState {
        return {
            ...this.state,
            snake: this.state.snake.map(pos => ({ ...pos })),
            food: { ...this.state.food }
        };
    }

    // Get the head position
    getHead(): Position {
        return { ...this.state.snake[0] };
    }

    // Check if game is over
    isGameOver(): boolean {
        return this.state.gameOver;
    }

    // Get current score
    getScore(): number {
        return this.state.score;
    }
}
