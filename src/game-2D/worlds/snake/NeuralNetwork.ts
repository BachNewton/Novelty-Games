// Simple feedforward neural network for Snake AI
// Uses ReLU activation for hidden layers and linear output for Q-values (DQN)

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
    // Returns raw Q-values (no softmax for DQN)
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
            output[i] = sum; // Return raw Q-values (Linear activation)
        }

        return output;
    }

    // Generic backpropagation training method
    // Calculates gradients based on the difference between Prediction and Target (MSE Loss)
    public train(input: number[], targetOutputs: number[], learningRate: number): void {
        const hidden: number[] = [];
        const hiddenSums: number[] = [];

        // Forward pass to get intermediate values
        for (let i = 0; i < this.hiddenSize; i++) {
            let sum = this.weights.hiddenBias[i];
            for (let j = 0; j < this.inputSize; j++) {
                sum += input[j] * this.weights.inputToHidden[i][j];
            }
            hiddenSums[i] = sum;
            hidden[i] = this.relu(sum);
        }

        const currentOutputs = this.forward(input);

        // Calculate Output Errors (Target - Output)
        const outputErrors: number[] = [];
        for (let i = 0; i < this.outputSize; i++) {
            outputErrors[i] = targetOutputs[i] - currentOutputs[i];
        }

        // Backprop Output Layer
        // For linear output, gradient is just 1 * error
        for (let i = 0; i < this.outputSize; i++) {
            const gradient = outputErrors[i] * learningRate;

            this.weights.outputBias[i] += gradient;
            for (let j = 0; j < this.hiddenSize; j++) {
                this.weights.hiddenToOutput[i][j] += gradient * hidden[j];
            }
        }

        // Backprop Hidden Layer
        for (let i = 0; i < this.hiddenSize; i++) {
            let error = 0;
            for (let j = 0; j < this.outputSize; j++) {
                error += outputErrors[j] * this.weights.hiddenToOutput[j][i];
            }

            // ReLU Derivative: 1 if x > 0, else 0
            const gradient = (hiddenSums[i] > 0 ? 1 : 0) * error * learningRate;

            this.weights.hiddenBias[i] += gradient;
            for (let j = 0; j < this.inputSize; j++) {
                this.weights.inputToHidden[i][j] += gradient * input[j];
            }
        }
    }

    private relu(x: number): number {
        return Math.max(0, x);
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

