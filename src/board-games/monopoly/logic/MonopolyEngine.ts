import { MonopolyState } from "../data/MonopolyState";

export interface MonopolyEngine {
    roll: (formerState: MonopolyState) => MonopolyState;
}

export function createMonopolyEngine(): MonopolyEngine {
    return {
        roll: (formerState) => {
            const state = { ...formerState };

            const currentPlayer = state.players[state.currentPlayerIndex];
            currentPlayer.position = (currentPlayer.position + 1) % state.board.length;

            state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

            return state;
        }
    };
}
