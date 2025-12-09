import { Direction, Position, SnakeGameState } from "./SnakeWorld";
import { NeuralNetwork, NeuralNetworkWeights } from "./NeuralNetwork";

export interface Experience {
    state: number[];
    action: number;
    reward: number;
    nextState: number[] | null; // null if game over
    done: boolean;
    priority: number; // For prioritized experience replay
}

// Input features for the neural network
// Vision rays in 8 directions (Up, Down, Left, Right, and Diagonals)
// Each direction has 3 features: [distanceToWall, distanceToFood, distanceToBody]
// Plus additional features: tail direction (2), current direction (4), snake length normalized (1)
// Total: 3 * 8 + 2 + 4 + 1 = 31 inputs
const INPUT_SIZE = 31;
const HIDDEN_SIZE = 96;
const HIDDEN2_SIZE = 48; // Second hidden layer
const OUTPUT_SIZE = 4; // UP, DOWN, LEFT, RIGHT

export class SnakeAI {
    private network: NeuralNetwork;
    private targetNetwork: NeuralNetwork; // Target network for stable learning
    private explorationRate: number = 0.3; // Start with 30% exploration
    private minExplorationRate: number = 0.05;
    private explorationDecay: number = 0.997;
    private learningRate: number = 0.001; // Reduced for stability with Adam-like updates
    private learningRateMomentum: number = 0.9; // Momentum for adaptive learning
    private learningRateVelocity: number = 0.999; // Velocity for adaptive learning (Adam-like)
    private discountFactor: number = 0.95; // Discount future rewards (gamma)
    private replayBuffer: Experience[] = [];
    private maxMemory: number = 10000; // Increased for more diverse experiences
    private batchSize: number = 64; // Increased for more stable gradients
    private minPriority: number = 0.01; // Minimum priority for all experiences
    private priorityAlpha: number = 0.6; // How much prioritization to use (0 = uniform, 1 = full priority)
    private priorityBeta: number = 0.4; // Importance sampling correction (increases to 1)
    private priorityBetaIncrement: number = 0.001; // Increase beta over time
    private lastState: number[] | null = null;
    private lastAction: number | null = null;
    private lastQValues: number[] | null = null;
    private lastWasExploration: boolean = false;
    private gamesPlayed: number = 0;
    private bestScore: number = 0;
    private scoreHistory: number[] = [];
    private totalScore: number = 0;
    private targetUpdateFrequency: number = 100; // Update target network every 100 games
    private trainingStepsPerGame: number = 10; // Train multiple times per game end

    // Adam-like optimizer state
    private gradientMoments: Map<string, number> = new Map();
    private gradientVelocities: Map<string, number> = new Map();

    constructor(weights?: NeuralNetworkWeights, targetWeights?: NeuralNetworkWeights) {
        this.network = new NeuralNetwork(INPUT_SIZE, HIDDEN_SIZE, HIDDEN2_SIZE, OUTPUT_SIZE, weights);
        this.targetNetwork = new NeuralNetwork(INPUT_SIZE, HIDDEN_SIZE, HIDDEN2_SIZE, OUTPUT_SIZE, targetWeights || weights);
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

        // Vision rays (24 features)
        for (const [dx, dy] of directions) {
            features.push(...this.lookInDirection(head, dx, dy, gameState));
        }

        // Tail direction relative to head (2 features: normalized x, y)
        if (gameState.snake.length > 1) {
            const tail = gameState.snake[gameState.snake.length - 1];
            const tailDx = (tail.x - head.x) / gameState.gridSize;
            const tailDy = (tail.y - head.y) / gameState.gridSize;
            features.push(tailDx, tailDy);
        } else {
            features.push(0, 0);
        }

        // Current direction one-hot encoding (4 features)
        features.push(
            gameState.direction === Direction.UP ? 1 : 0,
            gameState.direction === Direction.DOWN ? 1 : 0,
            gameState.direction === Direction.LEFT ? 1 : 0,
            gameState.direction === Direction.RIGHT ? 1 : 0
        );

        // Snake length normalized (1 feature)
        const maxPossibleLength = gameState.gridSize * gameState.gridSize;
        features.push(gameState.snake.length / maxPossibleLength);

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

    // Store experience in replay buffer with priority
    public remember(state: number[], action: number, reward: number, nextState: number[] | null, done: boolean): void {
        // Calculate initial priority (use max priority for new experiences)
        const maxPriority = this.replayBuffer.length > 0
            ? Math.max(...this.replayBuffer.map(e => e.priority))
            : 1.0;

        this.replayBuffer.push({
            state,
            action,
            reward,
            nextState,
            done,
            priority: maxPriority // New experiences get high priority
        });

        if (this.replayBuffer.length > this.maxMemory) {
            this.replayBuffer.shift(); // Remove oldest
        }
    }

    // Train the network using Prioritized Experience Replay (DQN with target network)
    public trainExperienceReplay(): void {
        if (this.replayBuffer.length < this.batchSize) return;

        // Calculate sampling probabilities based on priorities
        const priorities = this.replayBuffer.map(e => Math.pow(e.priority, this.priorityAlpha));
        const totalPriority = priorities.reduce((sum, p) => sum + p, 0);
        const probabilities = priorities.map(p => p / totalPriority);

        const trainingBatch: { input: number[], target: number[], index: number, tdError: number }[] = [];

        // Sample batch using priorities
        for (let i = 0; i < this.batchSize; i++) {
            // Weighted random sampling
            let rand = Math.random();
            let index = 0;
            let cumProb = probabilities[0];

            while (rand > cumProb && index < this.replayBuffer.length - 1) {
                index++;
                cumProb += probabilities[index];
            }

            const exp = this.replayBuffer[index];

            // Use target network for stable Q-value targets
            const currentQ = this.network.forward(exp.state);
            let targetQ = [...currentQ];

            let tdError = 0;
            if (exp.done) {
                tdError = Math.abs(exp.reward - currentQ[exp.action]);
                targetQ[exp.action] = exp.reward;
            } else {
                if (exp.nextState) {
                    // Use target network for next Q-values (Double DQN style)
                    const nextQ = this.targetNetwork.forward(exp.nextState);
                    const maxNextQ = Math.max(...nextQ);
                    const targetValue = exp.reward + this.discountFactor * maxNextQ;
                    tdError = Math.abs(targetValue - currentQ[exp.action]);
                    targetQ[exp.action] = targetValue;
                }
            }

            trainingBatch.push({ input: exp.state, target: targetQ, index, tdError });
        }

        // Update priorities based on TD errors
        for (const batch of trainingBatch) {
            this.replayBuffer[batch.index].priority = Math.abs(batch.tdError) + this.minPriority;
        }

        // Train network with batch
        this.network.trainBatch(
            trainingBatch.map(b => ({ input: b.input, target: b.target })),
            this.learningRate
        );

        // Increase beta over time for importance sampling
        this.priorityBeta = Math.min(1.0, this.priorityBeta + this.priorityBetaIncrement);
    }

    // Called when game ends - now with batch training
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

        // Train multiple times at game end for better learning
        for (let i = 0; i < this.trainingStepsPerGame; i++) {
            this.trainExperienceReplay();
        }

        // Update target network periodically
        if (this.gamesPlayed % this.targetUpdateFrequency === 0) {
            this.targetNetwork.copyWeightsFrom(this.network);
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
    public getWeights(): { network: NeuralNetworkWeights, target: NeuralNetworkWeights } {
        return {
            network: this.network.getWeights(),
            target: this.targetNetwork.getWeights()
        };
    }

    // Set network weights (for loading)
    public setWeights(weights: { network: NeuralNetworkWeights, target: NeuralNetworkWeights }): void {
        this.network.setWeights(weights.network);
        this.targetNetwork.setWeights(weights.target);
    }

    // Reset AI to initial state (for starting fresh)
    public reset(): void {
        this.network = new NeuralNetwork(INPUT_SIZE, HIDDEN_SIZE, HIDDEN2_SIZE, OUTPUT_SIZE);
        this.targetNetwork = new NeuralNetwork(INPUT_SIZE, HIDDEN_SIZE, HIDDEN2_SIZE, OUTPUT_SIZE);
        this.targetNetwork.copyWeightsFrom(this.network);
        this.explorationRate = 0.3;
        this.gamesPlayed = 0;
        this.bestScore = 0;
        this.totalScore = 0;
        this.scoreHistory = [];
        this.replayBuffer = [];
        this.lastState = null;
        this.lastAction = null;
        this.lastQValues = null;
        this.priorityBeta = 0.4;
        this.gradientMoments.clear();
        this.gradientVelocities.clear();
    }
}

