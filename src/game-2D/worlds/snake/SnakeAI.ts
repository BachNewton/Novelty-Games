import { Direction, Position, SnakeGameState } from "./SnakeWorld";
import { NeuralNetwork, NeuralNetworkWeights } from "./NeuralNetwork";

export interface Experience {
    state: number[];
    action: number;
    reward: number;
    nextState: number[] | null; // null if game over
    done: boolean;
}

// Input features for the neural network
// Vision rays in 8 directions (Up, Down, Left, Right, and Diagonals)
// Each direction has 3 features: [distanceToWall, distanceToFood, distanceToBody]
// Total: 3 * 8 = 24 inputs
const INPUT_SIZE = 24;
const HIDDEN_SIZE = 96; // Increased from 24 to 96 to handle complexity
const OUTPUT_SIZE = 4; // UP, DOWN, LEFT, RIGHT

export class SnakeAI {
    private network: NeuralNetwork;
    private explorationRate: number = 0.3; // Start with 30% exploration
    private minExplorationRate: number = 0.05;
    private explorationDecay: number = 0.997; // Even faster decay - reaches ~5% after ~1000 games
    private learningRate: number = 0.01; // Learning rate for DQN
    private discountFactor: number = 0.95; // Discount future rewards (gamma)
    private replayBuffer: Experience[] = [];
    private maxMemory: number = 2000;
    private batchSize: number = 32;
    private lastState: number[] | null = null;
    private lastAction: number | null = null;
    private lastQValues: number[] | null = null;
    private lastWasExploration: boolean = false;
    private gamesPlayed: number = 0;
    private bestScore: number = 0;
    private scoreHistory: number[] = []; // Keep last 1000 scores
    private totalScore: number = 0;

    constructor(weights?: NeuralNetworkWeights) {
        this.network = new NeuralNetwork(INPUT_SIZE, HIDDEN_SIZE, OUTPUT_SIZE, weights);
    }

    // Helper to look in a specific direction and return vision features
    private lookInDirection(
        head: Position,
        xStep: number,
        yStep: number,
        gameState: SnakeGameState
    ): number[] {
        let distanceToWall = 0;
        let distanceToBody = 0;
        let distanceToFood = 0;

        let currX = head.x;
        let currY = head.y;

        let distance = 0;
        let foundBody = false;
        let foundFood = false;

        // Move outward until wall hit
        while (true) {
            currX += xStep;
            currY += yStep;
            distance += 1;

            // Check Wall
            if (currX < 0 || currX >= gameState.gridSize || currY < 0 || currY >= gameState.gridSize) {
                distanceToWall = 1 / distance;
                break;
            }

            // Check Food (Now uses 1/distance to prioritize closer food)
            if (!foundFood && currX === gameState.food.x && currY === gameState.food.y) {
                distanceToFood = 1; // You can also use (1 / distance) to prefer closer food
                foundFood = true;
            }

            // Check Body
            if (!foundBody) {
                if (gameState.snake.some(s => s.x === currX && s.y === currY)) {
                    distanceToBody = 1 / distance;
                    foundBody = true;
                }
            }
        }

        return [distanceToWall, distanceToFood, distanceToBody];
    }

    // Convert game state to neural network input features using vision rays
    public stateToFeatures(gameState: SnakeGameState): number[] {
        const head = gameState.snake[0];
        const features: number[] = [];

        // 8 Directions: Up, UpRight, Right, DownRight, Down, DownLeft, Left, UpLeft
        const directions = [
            [0, -1],  // UP
            [1, -1],  // UP-RIGHT
            [1, 0],   // RIGHT
            [1, 1],   // DOWN-RIGHT
            [0, 1],   // DOWN
            [-1, 1],  // DOWN-LEFT
            [-1, 0],  // LEFT
            [-1, -1]  // UP-LEFT
        ];

        for (const [dx, dy] of directions) {
            features.push(...this.lookInDirection(head, dx, dy, gameState));
        }

        return features;
    }

    // Get the next action from the AI
    public getAction(gameState: SnakeGameState): Direction {
        const features = this.stateToFeatures(gameState);
        this.lastState = features;

        // Epsilon Greedy Strategy
        if (Math.random() < this.explorationRate) {
            // Explore: random action
            this.lastAction = Math.floor(Math.random() * OUTPUT_SIZE);
            this.lastWasExploration = true;
            this.lastQValues = null; // Don't store Q-values for random actions
        } else {
            // Exploit: use neural network Q-values
            const qValues = this.network.forward(features);
            this.lastQValues = qValues;
            this.lastWasExploration = false;

            // Argmax: find action with highest Q-value
            let maxVal = -Infinity;
            let maxIdx = 0;
            for (let i = 0; i < qValues.length; i++) {
                if (qValues[i] > maxVal) {
                    maxVal = qValues[i];
                    maxIdx = i;
                }
            }
            this.lastAction = maxIdx;
        }

        return this.indexToDirection(this.lastAction);
    }

    // Get current decision information for visualization
    public getDecisionInfo(): {
        features: number[];
        qValues: number[];
        selectedAction: number;
        wasExploration: boolean;
    } | null {
        if (this.lastState === null || this.lastAction === null) {
            return null;
        }

        // If we don't have Q-values (exploration), compute them for visualization
        let qValues = this.lastQValues;
        if (!qValues) {
            qValues = this.network.forward(this.lastState);
        }

        return {
            features: [...this.lastState],
            qValues: [...qValues],
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

    // Store experience in replay buffer
    public remember(state: number[], action: number, reward: number, nextState: number[] | null, done: boolean): void {
        this.replayBuffer.push({ state, action, reward, nextState, done });
        if (this.replayBuffer.length > this.maxMemory) {
            this.replayBuffer.shift(); // Remove oldest
        }
    }

    // Train the network using Experience Replay (DQN)
    public trainExperienceReplay(): void {
        if (this.replayBuffer.length < this.batchSize) return;

        const trainingBatch: { input: number[], target: number[] }[] = [];

        // Sample random batch
        for (let i = 0; i < this.batchSize; i++) {
            const index = Math.floor(Math.random() * this.replayBuffer.length);
            const exp = this.replayBuffer[index];

            const currentQ = this.network.forward(exp.state);
            let targetQ = [...currentQ];

            if (exp.done) {
                targetQ[exp.action] = exp.reward;
            } else {
                if (exp.nextState) {
                    const nextQ = this.network.forward(exp.nextState);
                    const maxNextQ = Math.max(...nextQ);
                    targetQ[exp.action] = exp.reward + this.discountFactor * maxNextQ;
                }
            }

            trainingBatch.push({ input: exp.state, target: targetQ });
        }

        // Train once per batch
        this.network.trainBatch(trainingBatch, this.learningRate);
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

        // Clear last state/action for next game
        this.lastState = null;
        this.lastAction = null;
        this.lastQValues = null;
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

    // Reset AI to initial state (for starting fresh)
    public reset(): void {
        this.network = new NeuralNetwork(INPUT_SIZE, HIDDEN_SIZE, OUTPUT_SIZE);
        this.explorationRate = 0.3;
        this.gamesPlayed = 0;
        this.bestScore = 0;
        this.totalScore = 0;
        this.scoreHistory = [];
        this.replayBuffer = [];
        this.lastState = null;
        this.lastAction = null;
        this.lastQValues = null;
    }
}

