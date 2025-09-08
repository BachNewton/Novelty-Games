import { Player } from "./Player";
import { Square } from "./Square";

export interface MonopolyState {
    board: Square[];
    players: Player[];
}
