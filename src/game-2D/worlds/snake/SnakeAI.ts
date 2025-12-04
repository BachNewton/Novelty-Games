import { Direction, Position, SnakeGameState } from "./SnakeWorld";
import { NeuralNetwork, NeuralNetworkWeights } from "./NeuralNetwork";

export interface GameExperience {
    state: number[];
    action: number;
    reward: number;
}

// Input features for the neural network
// 1-2: Relative food position (normalized)
// 3-6: Danger in each direction (1 = danger, 0 = safe)
// 7-10: Current direction (one-hot encoded)
// 11-14: Distance to wall in each direction (normalized)
const INPUT_SIZE = 14;
const HIDDEN_SIZE = 16;
const OUTPUT_SIZE = 4; // UP, DOWN, LEFT, RIGHT

export class SnakeAI {
    private network: NeuralNetwork;
    private explorationRate: number = 0.3; // Start with 30% exploration
    private minExplorationRate: number = 0.05;
    private explorationDecay: number = 0.9995; // Decay exploration over time
    private learningRate: number = 0.01;
    private gameHistory: GameExperience[] = [];
    private lastState: number[] | null = null;
    private lastAction: number | null = null;
    private lastProbabilities: number[] | null = null;
    private lastWasExploration: boolean = false;
    private gamesPlayed: number = 0;
    private bestScore: number = 0;
    private scoreHistory: number[] = []; // Keep last 1000 scores
    private totalScore: number = 0;

    constructor(weights?: NeuralNetworkWeights) {
        this.network = new NeuralNetwork(INPUT_SIZE, HIDDEN_SIZE, OUTPUT_SIZE, weights);
    }

    // Convert game state to neural network input features
    private stateToFeatures(gameState: SnakeGameState): number[] {
        const head = gameState.snake[0];
        const features: number[] = [];

        // 1-2: Relative food position (normalized to -1 to 1)
        const foodDx = (gameState.food.x - head.x) / gameState.gridSize;
        const foodDy = (gameState.food.y - head.y) / gameState.gridSize;
        features.push(foodDx);
        features.push(foodDy);

        // 3-6: Danger in each direction (1 = danger, 0 = safe)
        features.push(this.checkDanger(head, Direction.UP, gameState) ? 1 : 0);
        features.push(this.checkDanger(head, Direction.DOWN, gameState) ? 1 : 0);
        features.push(this.checkDanger(head, Direction.LEFT, gameState) ? 1 : 0);
        features.push(this.checkDanger(head, Direction.RIGHT, gameState) ? 1 : 0);

        // 7-10: Current direction (one-hot encoded)
        features.push(gameState.direction === Direction.UP ? 1 : 0);
        features.push(gameState.direction === Direction.DOWN ? 1 : 0);
        features.push(gameState.direction === Direction.LEFT ? 1 : 0);
        features.push(gameState.direction === Direction.RIGHT ? 1 : 0);

        // 11-14: Distance to wall in each direction (normalized 0 to 1)
        features.push(head.y / gameState.gridSize); // Distance to top wall
        features.push((gameState.gridSize - 1 - head.y) / gameState.gridSize); // Distance to bottom wall
        features.push(head.x / gameState.gridSize); // Distance to left wall
        features.push((gameState.gridSize - 1 - head.x) / gameState.gridSize); // Distance to right wall

        return features;
    }

    private checkDanger(head: Position, direction: Direction, gameState: SnakeGameState): boolean {
        let nextX = head.x;
        let nextY = head.y;

        switch (direction) {
            case Direction.UP:
                nextY -= 1;
                break;
            case Direction.DOWN:
                nextY += 1;
                break;
            case Direction.LEFT:
                nextX -= 1;
                break;
            case Direction.RIGHT:
                nextX += 1;
                break;
        }

        // Check wall collision
        if (nextX < 0 || nextX >= gameState.gridSize || nextY < 0 || nextY >= gameState.gridSize) {
            return true;
        }

        // Check self collision
        return gameState.snake.some(segment => segment.x === nextX && segment.y === nextY);
    }

    // Get the next action from the AI
    public getAction(gameState: SnakeGameState): Direction {
        const features = this.stateToFeatures(gameState);
        this.lastState = features;

        // Get probabilities from network
        const probabilities = this.network.forward(features);
        this.lastProbabilities = probabilities;

        let actionIndex: number;

        // Exploration vs exploitation
        if (Math.random() < this.explorationRate) {
            // Explore: random action
            actionIndex = Math.floor(Math.random() * OUTPUT_SIZE);
            this.lastWasExploration = true;
        } else {
            // Exploit: use neural network
            actionIndex = this.network.predict(features);
            this.lastWasExploration = false;
        }

        this.lastAction = actionIndex;
        return this.indexToDirection(actionIndex);
    }

    // Get current decision information for visualization
    public getDecisionInfo(): {
        features: number[];
        probabilities: number[];
        selectedAction: number;
        wasExploration: boolean;
    } | null {
        if (this.lastState === null || this.lastProbabilities === null || this.lastAction === null) {
            return null;
        }

        return {
            features: [...this.lastState],
            probabilities: [...this.lastProbabilities],
            selectedAction: this.lastAction,
            wasExploration: this.lastWasExploration
        };
    }

    private indexToDirection(index: number): Direction {
        switch (index) {
            case 0: return Direction.UP;
            case 1: return Direction.DOWN;
            case 2: return Direction.LEFT;
            case 3: return Direction.RIGHT;
            default: return Direction.RIGHT;
        }
    }

    // Record reward for the last action
    public recordReward(reward: number, gameState: SnakeGameState): void {
        if (this.lastState === null || this.lastAction === null) {
            return;
        }

        this.gameHistory.push({
            state: this.lastState,
            action: this.lastAction,
            reward: reward
        });

        // Update network immediately (online learning)
        this.network.updateWeights(this.lastState, this.lastAction, reward, this.learningRate);
    }

    // Called when game ends
    public onGameEnd(finalScore: number): void {
        this.gamesPlayed++;
        this.totalScore += finalScore;

        if (finalScore > this.bestScore) {
            this.bestScore = finalScore;
        }

        // Track score history (keep last 1000)
        this.scoreHistory.push(finalScore);
        if (this.scoreHistory.length > 1000) {
            this.scoreHistory.shift();
        }

        // Decay exploration rate
        this.explorationRate = Math.max(
            this.minExplorationRate,
            this.explorationRate * this.explorationDecay
        );

        // Clear history for next game
        this.gameHistory = [];
        this.lastState = null;
        this.lastAction = null;
        this.lastProbabilities = null;
    }

    // Get AI statistics
    public getStats(): {
        gamesPlayed: number;
        bestScore: number;
        explorationRate: number;
        averageScore: number;
        scoreHistory: number[];
    } {
        return {
            gamesPlayed: this.gamesPlayed,
            bestScore: this.bestScore,
            explorationRate: this.explorationRate,
            averageScore: this.gamesPlayed > 0 ? this.totalScore / this.gamesPlayed : 0,
            scoreHistory: [...this.scoreHistory]
        };
    }

    // Set stats (for loading from storage)
    public setStats(stats: {
        gamesPlayed: number;
        bestScore: number;
        explorationRate: number;
        scoreHistory: number[];
        totalScore: number;
    }): void {
        this.gamesPlayed = stats.gamesPlayed;
        this.bestScore = stats.bestScore;
        this.explorationRate = stats.explorationRate;
        this.scoreHistory = [...stats.scoreHistory];
        this.totalScore = stats.totalScore;
    }

    // Get network weights for saving
    public getWeights(): NeuralNetworkWeights {
        return this.network.getWeights();
    }

    // Set network weights (for loading)
    public setWeights(weights: NeuralNetworkWeights): void {
        this.network.setWeights(weights);
    }
}

