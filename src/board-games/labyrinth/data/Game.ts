import { Piece } from "./Piece";
import { Player } from "./Player";

export interface Game {
    pieces: Piece[][];
    sparePiece: SparePiece;
    players: Player[],
    currentPlayerIndex: number;
}

interface SparePiece {
    piece: Piece;
    position: TrianglePosition;
}

export interface TrianglePosition {
    x: number;
    y: number;
}
