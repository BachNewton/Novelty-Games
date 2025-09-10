import { randomInt } from "../../../util/Randomizer";
import { MonopolyState } from "../data/MonopolyState";
import { Player } from "../data/Player";
import { Property, Square } from "../data/Square";

export interface MonopolyEngine {
    roll: (formerState: MonopolyState) => MonopolyState;
    buyProperty: (formerState: MonopolyState) => MonopolyState;
}

export function createMonopolyEngine(): MonopolyEngine {
    return {
        roll: (formerState) => {
            const state = { ...formerState };

            const currentPlayer = getCurrentPlayer(state);

            console.log("Rolling dice for player:", currentPlayer.name);

            rollAndMove(state);

            console.log("Player moved to position:", currentPlayer.position);

            const square = state.board[currentPlayer.position];

            console.log("Player laned on:", square.name);

            if (isProperty(square) && square.ownedByPlayerIndex === null) {
                console.log("Property is unowned, entering buy-property phase:", square.name);
                state.phase = { type: 'buy-property', property: square };
            } else {
                moveToNextPlayer(state);
                state.phase = { type: 'ready' };
            }

            return state;
        },

        buyProperty: (formerState) => {
            const state = { ...formerState };

            if (state.phase.type !== 'buy-property') return state;

            const currentPlayer = getCurrentPlayer(state);
            const property = state.phase.property;

            currentPlayer.money -= property.price;
            property.ownedByPlayerIndex = state.currentPlayerIndex;

            moveToNextPlayer(state);
            state.phase = { type: 'ready' };

            return state;
        }
    };
}

function getCurrentPlayer(state: MonopolyState): Player {
    return state.players[state.currentPlayerIndex];
}

function rollAndMove(state: MonopolyState) {
    const currentPlayer = getCurrentPlayer(state);

    const die1 = randomInt(6) + 1;
    const die2 = randomInt(6) + 1;
    const roll = die1 + die2;

    currentPlayer.position = (currentPlayer.position + roll) % state.board.length;
}

export function isProperty(square: Square): square is Property {
    return square.type === 'street' || square.type === 'railroad' || square.type === 'electric-utility' || square.type === 'water-utility';
}

function moveToNextPlayer(state: MonopolyState) {
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
}
