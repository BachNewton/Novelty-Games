import { Card } from "./Card";

export interface Player {
    name: string;
    card1: Card | null;
    card2: Card | null;
    isTurn: boolean;
    stack: number;
}
