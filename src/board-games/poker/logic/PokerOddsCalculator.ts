import { Card } from "../data/Card";
import { Calculator } from "@alexjamesmalcolm/poker-odds-machine";
import { Player } from "../data/Player";

const ITERATIONS = 30000;

export interface PokerOddsCalculator {
    calculate: (cards1: Card | null, cards2: Card | null, board: Card[], players: Player[]) => number | null;
}

export function createPokerOddsCalculator(): PokerOddsCalculator {
    let lastHand = '';
    let lastBoard = '';
    let lastNumPlayers = 0;
    let lastWinPercent: number | null = null;

    return {
        calculate: (card1, card2, board, players) => {
            if (card1 === null || card2 === null) return null;

            const numPlayers = getNumPlayers(players);

            if (numPlayers < 1) return null;

            const hand = toOddsCards([card1, card2]);
            const boardCards = toOddsCards(board);

            if (lastHand === hand && lastBoard === boardCards && lastNumPlayers === numPlayers) return lastWinPercent;

            lastHand = hand;
            lastBoard = boardCards;
            lastNumPlayers = numPlayers;

            const simulation = new Calculator({
                hands: [hand],
                board: boardCards,
                numPlayers: numPlayers,
                iterations: ITERATIONS
            }).simulate();

            const winPercent = getWinPercent(simulation);
            lastWinPercent = winPercent;

            return winPercent;
        }
    };
}

function getWinPercent(simulation: Record<string, any>): number | null {
    return simulation[Object.keys(simulation).find(key => !key.startsWith('NPC ')) as keyof typeof simulation]?.winPercent ?? null;
}

function getNumPlayers(players: Player[]) {
    return players.filter(p => p.lastAction !== 'Folded' && p.card1 !== null && p.card2 !== null).length;
}

function toOddsCard(card: Card): string {
    const rank = card.rank === '10' ? 'T' : card.rank;
    const suit = card.suit.toLowerCase();
    return `${rank}${suit}`;
}

function toOddsCards(cards: Card[]): string {
    return cards.map(toOddsCard).join(',');
}
