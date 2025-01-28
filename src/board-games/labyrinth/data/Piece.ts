export interface Piece {
    paths: number[];
    startingColor: PlayerColor | null;
    treasure: Treasure | null;
    rotate: (angle: number) => void;
    hasTop: () => boolean;
    hasBottom: () => boolean;
    hasLeft: () => boolean;
    hasRight: () => boolean;
}

export enum PlayerColor {
    RED, BLUE, YELLOW, GREEN
}

export enum Treasure {
    TROPHY, DAGGER, MONEY_BAG
}

function createPiece(paths: number[]): Piece {
    let rotation = 0;

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
        paths: paths,
        startingColor: null,
        treasure: null,
        hasTop: () => hasTop,
        hasBottom: () => hasBottom,
        hasLeft: () => hasLeft,
        hasRight: () => hasRight,
        rotate: (angle) => {
            rotation += angle;
            update();
        }
    };
}

export const STRAIGHT_PIECE = createPiece([0, Math.PI]);

export const CORNER_PIECE = createPiece([0, Math.PI / 2]);

export const T_PIECE = createPiece([0, Math.PI / 2, Math.PI]);
