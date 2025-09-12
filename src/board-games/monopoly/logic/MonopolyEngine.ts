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
            console.log(`It is ${currentPlayer.name}'s turn. Rolling the dice.`);

            rollAndMove(state);

            const square = state.board[currentPlayer.position];
            console.log(`${currentPlayer.name} moved to "${square.name}"`);

            if (isProperty(square)) {
                if (square.ownedByPlayerIndex === null) {
                    console.log("Property is unowned, entering buy-property phase:", square.name);
                    state.phase = { type: 'buy-property', property: square };
                } else {
                    const owner = state.players[square.ownedByPlayerIndex];
                    const owed = getOwed(square, state.board);

                    currentPlayer.money -= owed;
                    owner.money += owed;

                    console.log("Property is owned by:", owner.name);
                    console.log(`${currentPlayer.name} pays ${owner.name} ${owed}`);

                    moveToNextPlayer(state);
                }
            } else {
                moveToNextPlayer(state);
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
    state.phase = { type: 'ready' };
}

function getOwed(property: Property, board: Square[]): number {
    switch (property.type) {
        case 'street':
            return property.rent[0];
        case 'railroad':
            return property.cost[getRailroadsOwned(board, property.ownedByPlayerIndex) - 1];
        case 'electric-utility':
        case 'water-utility':
            return 1;
    }
}

function getRailroadsOwned(board: Square[], playerIndex: number | null): number {
    return board.filter(square => square.type === 'railroad' && square.ownedByPlayerIndex === playerIndex).length;
}
