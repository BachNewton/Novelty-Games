import { createStorer, StorageKey } from "../../../util/Storage";
import { NeuralNetworkWeights } from "./NeuralNetwork";

export interface SnakeAISaveData {
    weights: NeuralNetworkWeights;
    gamesPlayed: number;
    bestScore: number;
    explorationRate: number;
}

export function createSnakeAISorage() {
    return createStorer<SnakeAISaveData>(StorageKey.SNAKE_AI);
}

