import { Card, toCard } from "./Card";

export interface Player {
    name: string;
    card1: Card | null;
    card2: Card | null;
    isTurn: boolean;
    stack: number;
    lastAction: string | null;
    inPot: number;
    showCards: boolean;
    handEvaluation: string;
}

export function toPlayer(data: any): Player {
    return {
        name: data.name,
        card1: toCard(data.card1),
        card2: toCard(data.card2),
        isTurn: data.isTurn,
        stack: data.stack,
        lastAction: toLastAction(data.valTurn),
        inPot: data.moneyIn,
        showCards: data.isShown1 || data.isShown2,
        handEvaluation: data.handEvaluation ?? '?'
    };
}

function toLastAction(valTurn: string | number): string | null {
    if (typeof valTurn === 'number') {
        return 'Raised';
    }

    switch (valTurn) {
        case 'check':
            return 'Checked';
        case 'call':
            return 'Called';
        case 'fold':
            return 'Folded';
        case 'playerIsAllIn':
            return 'All In';
        default:
            return null;
    }
}
