import { createStorer, StorageKey } from "../../../util/Storage";
import { NeuralNetworkWeights } from "./NeuralNetwork";

export interface GameRecord {
    score: number;
    timestamp: number;
}

export interface SnakeAISaveData {
    weights: NeuralNetworkWeights;
    gamesPlayed: number;
    bestScore: number;
    explorationRate: number;
    scoreHistory: number[]; // Last 1000 scores for visualization
    totalScore: number;
}

export function createSnakeAISorage() {
    return createStorer<SnakeAISaveData>(StorageKey.SNAKE_AI);
}

