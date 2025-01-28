export interface Piece {
    paths: number[];
    rotation: number;
    startingColor: PlayerColor | null;
    treasure: Treasure | null;
}

export enum PlayerColor {
    RED, BLUE, YELLOW, GREEN
}

export enum Treasure {
    TROPHY, DAGGER, MONEY_BAG
}

export const STRAIGHT_PIECE: Piece = {
    paths: [0, Math.PI],
    rotation: 0,
    startingColor: null,
    treasure: null
};

export const CORNER_PIECE: Piece = {
    paths: [0, Math.PI / 2],
    rotation: 0,
    startingColor: null,
    treasure: null
};

export const T_PIECE: Piece = {
    paths: [0, Math.PI / 2, Math.PI],
    rotation: 0,
    startingColor: null,
    treasure: null
};