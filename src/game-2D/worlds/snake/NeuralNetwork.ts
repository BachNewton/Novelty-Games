// Simple feedforward neural network for Snake AI
// Uses ReLU activation for hidden layers and linear output for Q-values (DQN)
// Now with 2 hidden layers for better pattern recognition

export interface NeuralNetworkWeights {
    inputToHidden: number[][];
    hiddenBias: number[];
    hiddenToHidden2: number[][];
    hidden2Bias: number[];
    hidden2ToOutput: number[][];
    outputBias: number[];
}

export class NeuralNetwork {
    private inputSize: number;
    private hiddenSize: number;
    private hidden2Size: number;
    private outputSize: number;
    private weights: NeuralNetworkWeights;

    constructor(inputSize: number, hiddenSize: number, hidden2Size: number, outputSize: number, weights?: NeuralNetworkWeights) {
        this.inputSize = inputSize;
        this.hiddenSize = hiddenSize;
        this.hidden2Size = hidden2Size;
        this.outputSize = outputSize;

        if (weights) {
            this.weights = weights;
        } else {
            // Initialize with random weights
            this.weights = this.initializeWeights();
        }
    }

    private initializeWeights(): NeuralNetworkWeights {
        // Xavier/He initialization for better convergence with ReLU
        const inputToHidden: number[][] = [];
        for (let i = 0; i < this.hiddenSize; i++) {
            inputToHidden[i] = [];
            for (let j = 0; j < this.inputSize; j++) {
                inputToHidden[i][j] = (Math.random() * 2 - 1) * Math.sqrt(2 / this.inputSize);
            }
        }

        const hiddenBias: number[] = new Array(this.hiddenSize).fill(0);

        const hiddenToHidden2: number[][] = [];
        for (let i = 0; i < this.hidden2Size; i++) {
            hiddenToHidden2[i] = [];
            for (let j = 0; j < this.hiddenSize; j++) {
                hiddenToHidden2[i][j] = (Math.random() * 2 - 1) * Math.sqrt(2 / this.hiddenSize);
            }
        }

        const hidden2Bias: number[] = new Array(this.hidden2Size).fill(0);

        const hidden2ToOutput: number[][] = [];
        for (let i = 0; i < this.outputSize; i++) {
            hidden2ToOutput[i] = [];
            for (let j = 0; j < this.hidden2Size; j++) {
                hidden2ToOutput[i][j] = (Math.random() * 2 - 1) * Math.sqrt(2 / this.hidden2Size);
            }
        }

        const outputBias: number[] = new Array(this.outputSize).fill(0);

        return {
            inputToHidden,
            hiddenBias,
            hiddenToHidden2,
            hidden2Bias,
            hidden2ToOutput,
            outputBias
        };
    }

    // Forward pass: input -> hidden -> hidden2 -> output
    // Returns raw Q-values (no softmax for DQN)
    public forward(input: number[]): number[] {
        if (input.length !== this.inputSize) {
            throw new Error(`Input size mismatch: expected ${this.inputSize}, got ${input.length}`);
        }

        // Input to hidden layer 1
        const hidden: number[] = [];
        for (let i = 0; i < this.hiddenSize; i++) {
            let sum = this.weights.hiddenBias[i];
            for (let j = 0; j < this.inputSize; j++) {
                sum += input[j] * this.weights.inputToHidden[i][j];
            }
            hidden[i] = this.relu(sum);
        }

        // Hidden layer 1 to hidden layer 2
        const hidden2: number[] = [];
        for (let i = 0; i < this.hidden2Size; i++) {
            let sum = this.weights.hidden2Bias[i];
            for (let j = 0; j < this.hiddenSize; j++) {
                sum += hidden[j] * this.weights.hiddenToHidden2[i][j];
            }
            hidden2[i] = this.relu(sum);
        }

        // Hidden layer 2 to output layer
        const output: number[] = [];
        for (let i = 0; i < this.outputSize; i++) {
            let sum = this.weights.outputBias[i];
            for (let j = 0; j < this.hidden2Size; j++) {
                sum += hidden2[j] * this.weights.hidden2ToOutput[i][j];
            }
            output[i] = sum; // Return raw Q-values (Linear activation)
        }

        return output;
    }

    // Generic backpropagation training method for 2-layer network
    // Calculates gradients based on the difference between Prediction and Target (MSE Loss)
    public train(input: number[], targetOutputs: number[], learningRate: number): void {
        const hidden: number[] = [];
        const hiddenSums: number[] = [];
        const hidden2: number[] = [];
        const hidden2Sums: number[] = [];

        // Forward pass to get intermediate values - Layer 1
        for (let i = 0; i < this.hiddenSize; i++) {
            let sum = this.weights.hiddenBias[i];
            for (let j = 0; j < this.inputSize; j++) {
                sum += input[j] * this.weights.inputToHidden[i][j];
            }
            hiddenSums[i] = sum;
            hidden[i] = this.relu(sum);
        }

        // Forward pass - Layer 2
        for (let i = 0; i < this.hidden2Size; i++) {
            let sum = this.weights.hidden2Bias[i];
            for (let j = 0; j < this.hiddenSize; j++) {
                sum += hidden[j] * this.weights.hiddenToHidden2[i][j];
            }
            hidden2Sums[i] = sum;
            hidden2[i] = this.relu(sum);
        }

        const currentOutputs = this.forward(input);

        // Calculate Output Errors (Target - Output)
        const outputErrors: number[] = [];
        for (let i = 0; i < this.outputSize; i++) {
            outputErrors[i] = targetOutputs[i] - currentOutputs[i];
        }

        // Backprop Output Layer (hidden2 -> output)
        for (let i = 0; i < this.outputSize; i++) {
            const gradient = outputErrors[i] * learningRate;
            this.weights.outputBias[i] += gradient;
            for (let j = 0; j < this.hidden2Size; j++) {
                this.weights.hidden2ToOutput[i][j] += gradient * hidden2[j];
            }
        }

        // Backprop Hidden Layer 2 (hidden -> hidden2)
        for (let i = 0; i < this.hidden2Size; i++) {
            let error = 0;
            for (let j = 0; j < this.outputSize; j++) {
                error += outputErrors[j] * this.weights.hidden2ToOutput[j][i];
            }
            const gradient = (hidden2Sums[i] > 0 ? 1 : 0) * error * learningRate;
            this.weights.hidden2Bias[i] += gradient;
            for (let j = 0; j < this.hiddenSize; j++) {
                this.weights.hiddenToHidden2[i][j] += gradient * hidden[j];
            }
        }

        // Backprop Hidden Layer 1 (input -> hidden)
        for (let i = 0; i < this.hiddenSize; i++) {
            let error = 0;
            for (let j = 0; j < this.hidden2Size; j++) {
                const hidden2Error = (hidden2Sums[j] > 0 ? 1 : 0) *
                    (outputErrors.reduce((sum, outErr, outIdx) =>
                        sum + outErr * this.weights.hidden2ToOutput[outIdx][j], 0));
                error += hidden2Error * this.weights.hiddenToHidden2[j][i];
            }
            const gradient = (hiddenSums[i] > 0 ? 1 : 0) * error * learningRate;
            this.weights.hiddenBias[i] += gradient;
            for (let j = 0; j < this.inputSize; j++) {
                this.weights.inputToHidden[i][j] += gradient * input[j];
            }
        }
    }

    // Batch training method: accumulates gradients and updates once per batch
    // This stabilizes learning significantly
    public trainBatch(batch: { input: number[], target: number[] }[], learningRate: number): void {
        const batchSize = batch.length;

        // Accumulate gradients for all layers
        const hiddenBiasGrads = new Array(this.hiddenSize).fill(0);
        const hidden2BiasGrads = new Array(this.hidden2Size).fill(0);
        const outputBiasGrads = new Array(this.outputSize).fill(0);
        const inputToHiddenGrads = this.weights.inputToHidden.map(() => new Array(this.inputSize).fill(0));
        const hiddenToHidden2Grads = this.weights.hiddenToHidden2.map(() => new Array(this.hiddenSize).fill(0));
        const hidden2ToOutputGrads = this.weights.hidden2ToOutput.map(() => new Array(this.hidden2Size).fill(0));

        for (const sample of batch) {
            const { input, target } = sample;

            // 1. Forward pass - Layer 1
            const hidden: number[] = [];
            const hiddenSums: number[] = [];
            for (let i = 0; i < this.hiddenSize; i++) {
                let sum = this.weights.hiddenBias[i];
                for (let j = 0; j < this.inputSize; j++) {
                    sum += input[j] * this.weights.inputToHidden[i][j];
                }
                hiddenSums[i] = sum;
                hidden[i] = this.relu(sum);
            }

            // Forward pass - Layer 2
            const hidden2: number[] = [];
            const hidden2Sums: number[] = [];
            for (let i = 0; i < this.hidden2Size; i++) {
                let sum = this.weights.hidden2Bias[i];
                for (let j = 0; j < this.hiddenSize; j++) {
                    sum += hidden[j] * this.weights.hiddenToHidden2[i][j];
                }
                hidden2Sums[i] = sum;
                hidden2[i] = this.relu(sum);
            }

            // Forward pass - Output
            const currentOutputs: number[] = [];
            for (let i = 0; i < this.outputSize; i++) {
                let sum = this.weights.outputBias[i];
                for (let j = 0; j < this.hidden2Size; j++) {
                    sum += hidden2[j] * this.weights.hidden2ToOutput[i][j];
                }
                currentOutputs[i] = sum;
            }

            // 2. Calculate Output Errors
            const outputErrors: number[] = [];
            for (let i = 0; i < this.outputSize; i++) {
                outputErrors[i] = target[i] - currentOutputs[i];
            }

            // 3. Accumulate Gradients (Output Layer -> Hidden2)
            for (let i = 0; i < this.outputSize; i++) {
                const gradient = outputErrors[i];
                outputBiasGrads[i] += gradient;
                for (let j = 0; j < this.hidden2Size; j++) {
                    hidden2ToOutputGrads[i][j] += gradient * hidden2[j];
                }
            }

            // 4. Accumulate Gradients (Hidden2 Layer -> Hidden1)
            for (let i = 0; i < this.hidden2Size; i++) {
                let error = 0;
                for (let j = 0; j < this.outputSize; j++) {
                    error += outputErrors[j] * this.weights.hidden2ToOutput[j][i];
                }
                const gradient = (hidden2Sums[i] > 0 ? 1 : 0) * error;
                hidden2BiasGrads[i] += gradient;
                for (let j = 0; j < this.hiddenSize; j++) {
                    hiddenToHidden2Grads[i][j] += gradient * hidden[j];
                }
            }

            // 5. Accumulate Gradients (Hidden1 Layer -> Input)
            for (let i = 0; i < this.hiddenSize; i++) {
                let error = 0;
                for (let j = 0; j < this.hidden2Size; j++) {
                    const hidden2Error = (hidden2Sums[j] > 0 ? 1 : 0) *
                        (outputErrors.reduce((sum, outErr, outIdx) =>
                            sum + outErr * this.weights.hidden2ToOutput[outIdx][j], 0));
                    error += hidden2Error * this.weights.hiddenToHidden2[j][i];
                }
                const gradient = (hiddenSums[i] > 0 ? 1 : 0) * error;
                hiddenBiasGrads[i] += gradient;
                for (let j = 0; j < this.inputSize; j++) {
                    inputToHiddenGrads[i][j] += gradient * input[j];
                }
            }
        }

        // 6. Apply Averaged Gradients
        const rate = learningRate / batchSize;

        for (let i = 0; i < this.outputSize; i++) {
            this.weights.outputBias[i] += outputBiasGrads[i] * rate;
            for (let j = 0; j < this.hidden2Size; j++) {
                this.weights.hidden2ToOutput[i][j] += hidden2ToOutputGrads[i][j] * rate;
            }
        }

        for (let i = 0; i < this.hidden2Size; i++) {
            this.weights.hidden2Bias[i] += hidden2BiasGrads[i] * rate;
            for (let j = 0; j < this.hiddenSize; j++) {
                this.weights.hiddenToHidden2[i][j] += hiddenToHidden2Grads[i][j] * rate;
            }
        }

        for (let i = 0; i < this.hiddenSize; i++) {
            this.weights.hiddenBias[i] += hiddenBiasGrads[i] * rate;
            for (let j = 0; j < this.inputSize; j++) {
                this.weights.inputToHidden[i][j] += inputToHiddenGrads[i][j] * rate;
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
            hiddenToHidden2: this.weights.hiddenToHidden2.map(row => [...row]),
            hidden2Bias: [...this.weights.hidden2Bias],
            hidden2ToOutput: this.weights.hidden2ToOutput.map(row => [...row]),
            outputBias: [...this.weights.outputBias]
        };
    }

    // Copy weights from another network (for target network)
    public copyWeightsFrom(other: NeuralNetwork): void {
        this.weights = other.getWeights();
    }

    public setWeights(weights: NeuralNetworkWeights): void {
        this.weights = weights;
    }
}

