import { randomInt } from "../../../util/Randomizer";
import { MonopolyState } from "../data/MonopolyState";

export interface MonopolyEngine {
    roll: (formerState: MonopolyState) => MonopolyState;
}

export function createMonopolyEngine(): MonopolyEngine {
    return {
        roll: (formerState) => {
            const state = { ...formerState };

            const currentPlayer = state.players[state.currentPlayerIndex];

            const die1 = randomInt(6) + 1;
            const die2 = randomInt(6) + 1;
            const roll = die1 + die2;

            currentPlayer.position = (currentPlayer.position + roll) % state.board.length;
            state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

            state.log.push(`${currentPlayer.name}'s turn - rolled ${roll} (${die1}+${die2}) - landed on ${state.board[currentPlayer.position].name}`);

            return state;
        }
    };
}
