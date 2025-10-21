import { Player } from "./Player";
import { Property, Square } from "./Square";

export interface MonopolyState {
    board: Square[];
    players: Player[];
    phase: Phase;
    currentPlayerIndex: number;
    log: string[];
}

export type Phase = ReadyPhase | BuyPropertyPhase;

interface ReadyPhase {
    type: 'ready';
}

interface BuyPropertyPhase {
    type: 'buy-property';
    property: Property;
}
