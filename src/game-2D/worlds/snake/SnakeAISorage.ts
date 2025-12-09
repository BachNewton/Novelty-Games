import { createStorer, StorageKey } from "../../../util/Storage";
import { NeuralNetworkWeights } from "./NeuralNetwork";

export interface GameRecord {
    score: number;
    timestamp: number;
}

export interface SnakeAISaveData {
    weights: { network: NeuralNetworkWeights, target: NeuralNetworkWeights };
    gamesPlayed: number;
    bestScore: number;
    explorationRate: number;
    scoreHistory: number[];
    totalScore: number;
    version: number;
}

export function createSnakeAISorage() {
    return createStorer<SnakeAISaveData>(StorageKey.SNAKE_AI);
}

