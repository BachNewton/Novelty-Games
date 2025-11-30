import { Card } from "../data/Card";
import { Calculator } from "@alexjamesmalcolm/poker-odds-machine";
import { Player } from "../data/Player";

export interface PokerOddsCalculator {
    calculate: (cards1: Card | null, cards2: Card | null, board: Card[], players: Player[]) => void;
}

export function createPokerOddsCalculator(): PokerOddsCalculator {
    return {
        calculate: (card1, card2, board, players) => {
            if (card1 === null || card2 === null) {
                return;
            }

            const numPlayers = players.filter(p => p.lastAction !== 'Folded' && p.card1 !== null && p.card2 !== null).length;

            if (numPlayers < 1) {
                return;
            }

            const hand = toOddsCards([card1, card2]);
            const boardCards = toOddsCards(board);

            const simulation = new Calculator({
                hands: [hand],
                board: boardCards,
                numPlayers: numPlayers,
                iterations: 30000
            }).simulate();

            console.log(simulation);
        }
    };
}

function toOddsCard(card: Card): string {
    const rank = card.rank === '10' ? 'T' : card.rank;
    const suit = card.suit.toLowerCase();
    return `${rank}${suit}`;
}

function toOddsCards(cards: Card[]): string {
    return cards.map(toOddsCard).join(',');
}
