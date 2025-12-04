// Simple feedforward neural network for Snake AI
// Uses ReLU activation for hidden layers and softmax for output

export interface NeuralNetworkWeights {
    inputToHidden: number[][];
    hiddenBias: number[];
    hiddenToOutput: number[][];
    outputBias: number[];
}

export class NeuralNetwork {
    private inputSize: number;
    private hiddenSize: number;
    private outputSize: number;
    private weights: NeuralNetworkWeights;

    constructor(inputSize: number, hiddenSize: number, outputSize: number, weights?: NeuralNetworkWeights) {
        this.inputSize = inputSize;
        this.hiddenSize = hiddenSize;
        this.outputSize = outputSize;

        if (weights) {
            this.weights = weights;
        } else {
            // Initialize with random weights
            this.weights = this.initializeWeights();
        }
    }

    private initializeWeights(): NeuralNetworkWeights {
        // Xavier initialization
        const inputToHidden: number[][] = [];
        for (let i = 0; i < this.hiddenSize; i++) {
            inputToHidden[i] = [];
            for (let j = 0; j < this.inputSize; j++) {
                inputToHidden[i][j] = (Math.random() * 2 - 1) * Math.sqrt(2 / (this.inputSize + this.hiddenSize));
            }
        }

        const hiddenBias: number[] = new Array(this.hiddenSize).fill(0);

        const hiddenToOutput: number[][] = [];
        for (let i = 0; i < this.outputSize; i++) {
            hiddenToOutput[i] = [];
            for (let j = 0; j < this.hiddenSize; j++) {
                hiddenToOutput[i][j] = (Math.random() * 2 - 1) * Math.sqrt(2 / (this.hiddenSize + this.outputSize));
            }
        }

        const outputBias: number[] = new Array(this.outputSize).fill(0);

        return {
            inputToHidden,
            hiddenBias,
            hiddenToOutput,
            outputBias
        };
    }

    // Forward pass: input -> hidden -> output
    public forward(input: number[]): number[] {
        if (input.length !== this.inputSize) {
            throw new Error(`Input size mismatch: expected ${this.inputSize}, got ${input.length}`);
        }

        // Input to hidden layer
        const hidden: number[] = [];
        for (let i = 0; i < this.hiddenSize; i++) {
            let sum = this.weights.hiddenBias[i];
            for (let j = 0; j < this.inputSize; j++) {
                sum += input[j] * this.weights.inputToHidden[i][j];
            }
            hidden[i] = this.relu(sum);
        }

        // Hidden to output layer
        const output: number[] = [];
        for (let i = 0; i < this.outputSize; i++) {
            let sum = this.weights.outputBias[i];
            for (let j = 0; j < this.hiddenSize; j++) {
                sum += hidden[j] * this.weights.hiddenToOutput[i][j];
            }
            output[i] = sum; // Raw logits
        }

        // Apply softmax to get probabilities
        return this.softmax(output);
    }

    // Predict the best action (returns index of highest probability)
    public predict(input: number[]): number {
        const probabilities = this.forward(input);
        let maxIndex = 0;
        let maxProb = probabilities[0];
        for (let i = 1; i < probabilities.length; i++) {
            if (probabilities[i] > maxProb) {
                maxProb = probabilities[i];
                maxIndex = i;
            }
        }
        return maxIndex;
    }

    // Sample an action based on probabilities (for exploration)
    public sample(input: number[]): number {
        const probabilities = this.forward(input);
        const rand = Math.random();
        let cumulative = 0;
        for (let i = 0; i < probabilities.length; i++) {
            cumulative += probabilities[i];
            if (rand <= cumulative) {
                return i;
            }
        }
        return probabilities.length - 1;
    }

    // Update weights using gradient descent (simplified policy gradient)
    public updateWeights(
        input: number[],
        action: number,
        reward: number,
        learningRate: number = 0.01
    ): void {
        // Simplified policy gradient update
        // This is a basic implementation - in practice, you'd want to accumulate gradients
        // and update in batches, but this works for real-time learning

        const probabilities = this.forward(input);
        const actionProb = probabilities[action];

        // Compute gradients (simplified)
        // We want to increase the probability of good actions and decrease bad ones
        const gradientScale = reward * (1 - actionProb);

        // Update output layer weights
        const hidden = this.computeHidden(input);
        for (let i = 0; i < this.hiddenSize; i++) {
            const delta = gradientScale * hidden[i] * learningRate;
            this.weights.hiddenToOutput[action][i] += delta;
        }
        this.weights.outputBias[action] += gradientScale * learningRate;

        // Update hidden layer weights (backpropagation simplified)
        for (let i = 0; i < this.hiddenSize; i++) {
            if (hidden[i] > 0) { // ReLU derivative
                const hiddenGradient = gradientScale * this.weights.hiddenToOutput[action][i];
                for (let j = 0; j < this.inputSize; j++) {
                    this.weights.inputToHidden[i][j] += hiddenGradient * input[j] * learningRate;
                }
                this.weights.hiddenBias[i] += hiddenGradient * learningRate;
            }
        }
    }

    private computeHidden(input: number[]): number[] {
        const hidden: number[] = [];
        for (let i = 0; i < this.hiddenSize; i++) {
            let sum = this.weights.hiddenBias[i];
            for (let j = 0; j < this.inputSize; j++) {
                sum += input[j] * this.weights.inputToHidden[i][j];
            }
            hidden[i] = this.relu(sum);
        }
        return hidden;
    }

    private relu(x: number): number {
        return Math.max(0, x);
    }

    private softmax(logits: number[]): number[] {
        // Subtract max for numerical stability
        const max = Math.max(...logits);
        const exp = logits.map(x => Math.exp(x - max));
        const sum = exp.reduce((a, b) => a + b, 0);
        return exp.map(x => x / sum);
    }

    public getWeights(): NeuralNetworkWeights {
        // Return a deep copy
        return {
            inputToHidden: this.weights.inputToHidden.map(row => [...row]),
            hiddenBias: [...this.weights.hiddenBias],
            hiddenToOutput: this.weights.hiddenToOutput.map(row => [...row]),
            outputBias: [...this.weights.outputBias]
        };
    }

    public setWeights(weights: NeuralNetworkWeights): void {
        this.weights = weights;
    }
}

