import { Treasure } from "./Treasure";

export interface Piece {
    treasure: Treasure | null;
    rotate: (angle: number) => void;
    hasTop: () => boolean;
    hasBottom: () => boolean;
    hasLeft: () => boolean;
    hasRight: () => boolean;
    toJSON: () => any;
    isTraversable: boolean;
}

export enum PieceType {
    CORNER, T, STRAIGHT
}

export function createPiece(type: PieceType, srartingRotation: number, treasure?: Treasure): Piece {
    const paths = getPaths(type);

    let rotation = srartingRotation;

    let hasTop = false;
    let hasBottom = false;
    let hasLeft = false;
    let hasRight = false;

    const update = () => {
        const coordinates = paths.map(path => {
            const x = Math.cos(path + rotation);
            const y = Math.sin(path + rotation);

            return { x: Math.round(x), y: Math.round(y) };
        });

        hasTop = coordinates.find(coordinate => coordinate.y === 1) !== undefined;
        hasBottom = coordinates.find(coordinate => coordinate.y === -1) !== undefined;
        hasLeft = coordinates.find(coordinate => coordinate.x === -1) !== undefined;
        hasRight = coordinates.find(coordinate => coordinate.x === 1) !== undefined;
    };

    update();

    return {
        treasure: treasure ?? null,
        hasTop: () => hasTop,
        hasBottom: () => hasBottom,
        hasLeft: () => hasLeft,
        hasRight: () => hasRight,
        rotate: (angle) => {
            rotation += angle;
            update();
        },
        toJSON: () => {
            // TODO
        },
        isTraversable: false
    };
}

function getPaths(type: PieceType): number[] {
    switch (type) {
        case PieceType.CORNER:
            return [0, Math.PI / 2];
        case PieceType.STRAIGHT:
            return [0, Math.PI];
        case PieceType.T:
            return [0, Math.PI / 2, Math.PI];
    }
}
