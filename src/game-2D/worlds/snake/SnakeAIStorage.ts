import { createStorer, StorageKey } from "../../../util/Storage";
import { SerializedWeights } from "./NeuralNetwork";

export interface GameRecord {
    score: number;
    timestamp: number;
}

export interface SnakeAISaveData {
    weights: { network: SerializedWeights, target: SerializedWeights };
    gamesPlayed: number;
    bestScore: number;
    explorationRate: number;
    scoreHistory: number[];
    totalScore: number;
    version: number;
}

export function createSnakeAIStorage() {
    return createStorer<SnakeAISaveData>(StorageKey.SNAKE_AI);
}
