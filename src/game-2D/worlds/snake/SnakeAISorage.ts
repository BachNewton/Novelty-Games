import { createStorer, StorageKey } from "../../../util/Storage";
import { NeuralNetworkWeights } from "./NeuralNetwork";

export interface GameRecord {
    score: number;
    timestamp: number;
}

export interface SnakeAISaveData {
    weights: { network: NeuralNetworkWeights, target: NeuralNetworkWeights } | NeuralNetworkWeights; // Support both old and new format
    gamesPlayed: number;
    bestScore: number;
    explorationRate: number;
    scoreHistory: number[]; // Last 1000 scores for visualization
    totalScore: number;
    version?: number; // Version for future compatibility
}

export function createSnakeAISorage() {
    return createStorer<SnakeAISaveData>(StorageKey.SNAKE_AI);
}

