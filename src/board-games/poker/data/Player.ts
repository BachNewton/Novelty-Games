import { Card, toCard } from "./Card";

export interface Player {
    name: string;
    card1: Card | null;
    card2: Card | null;
    isTurn: boolean;
    stack: number;
}

export function toPlayer(data: any): Player {
    return {
        name: data.name,
        card1: toCard(data.card1),
        card2: toCard(data.card2),
        isTurn: data.isTurn,
        stack: data.stack
    };
}
