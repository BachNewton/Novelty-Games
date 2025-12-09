// Snake game type definitions

export enum Direction {
    UP = 'UP',
    DOWN = 'DOWN',
    LEFT = 'LEFT',
    RIGHT = 'RIGHT'
}

export type Position = {
    x: number;
    y: number;
}

export type SnakeGameState = {
    snake: Position[];
    food: Position;
    direction: Direction;
    nextDirection: Direction;
    score: number;
    gameOver: boolean;
    gridSize: number;
    cellSize: number;
}

// Game configuration constants
export const GRID_SIZE = 20;
export const INITIAL_SNAKE_LENGTH = 3;
export const GAME_SPEED_MS = 150;
export const MIN_SPEED_MULTIPLIER = 0.5;
export const MAX_SPEED_MULTIPLIER = 1000;
export const SPEED_STEP = 0.5;
export const POINTS_PER_FOOD = 10;
