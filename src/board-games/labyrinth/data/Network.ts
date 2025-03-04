import { Game, TrianglePosition } from "./Game";
import { createPiece, PieceType } from "./Piece";
import { Player } from "./Player";
import { Treasure } from "./Treasure";

export interface NetworkGame {
    pieces: NetworkPiece[][];
    sparePiece: NetworkSparePiece;
    players: Player[],
    currentPlayerIndex: number;
}

export interface NetworkPiece {
    treasure: Treasure | null;
    rotation: number;
    type: PieceType;
}

interface NetworkSparePiece {
    piece: NetworkPiece;
    position: TrianglePosition;
}

export function convertToNetworkGame(game: Game): NetworkGame {
    return {
        pieces: game.pieces.map(row => row.map(piece => piece.asNetworkPiece())),
        sparePiece: {
            piece: game.sparePiece.piece.asNetworkPiece(),
            position: game.sparePiece.position
        },
        players: game.players,
        currentPlayerIndex: game.currentPlayerIndex
    };
}

export function convertToGame(game: NetworkGame): Game {
    const sparePiece = game.sparePiece.piece;

    return {
        pieces: game.pieces.map(row => row.map(piece => createPiece(piece.type, piece.rotation, piece.treasure))),
        sparePiece: {
            piece: createPiece(sparePiece.type, sparePiece.rotation, sparePiece.treasure),
            position: game.sparePiece.position
        },
        players: game.players,
        currentPlayerIndex: game.currentPlayerIndex
    };
}
