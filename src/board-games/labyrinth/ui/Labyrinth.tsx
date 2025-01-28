import { useEffect, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import { getRandomElement, removeRandomElement } from "../../../util/Randomizer";
import { createPiece, Piece, PieceType, PlayerColor, Treasure } from "../data/Piece";
import PieceUi from "./Piece";

const CORNER_PIECES_IN_PILE = 9;
const STRAIGHT_PIECES_IN_PILE = 13;

interface State {
    pieces: Piece[][];
    sparePiece: Piece;
}

const Labyrinth: React.FC = () => {
    const [state, setState] = useState<State>(startingState());

    useEffect(() => {
        updateRoute(Route.LABYRINTH);
    }, []);

    const piecesUi = state.pieces.flatMap(rowPieces => rowPieces).map((piece, index) => {
        return <PieceUi key={index} data={piece} onClick={() => {
            highlightPaths(index, piece, state.pieces);

            setState({
                pieces: state.pieces.map(row => [...row]),
                sparePiece: state.sparePiece
            });
        }} />;
    });

    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridTemplateRows: 'repeat(7, 1fr)',
            aspectRatio: 1,
            maxHeight: '100vh',
            boxSizing: 'border-box',
            padding: '10px'
        }}>
            {piecesUi}
        </div>
    </div>;
};

function highlightPaths(index: number, piece: Piece, pieces: Piece[][]) {
    const cols = pieces[0].length;
    const y = Math.floor(index / cols);
    const x = index % cols;

    pieces.forEach(row => row.forEach(col => col.isTraversable = false));

    dfs(piece, new Set(), x, y, pieces);
}

function dfs(piece: Piece, visted: Set<Piece>, x: number, y: number, pieces: Piece[][]) {
    if (visted.has(piece)) return;

    visted.add(piece);
    piece.isTraversable = true;

    const above = pieces?.[y - 1]?.[x];
    const below = pieces?.[y + 1]?.[x];
    const toLeft = pieces[y]?.[x - 1];
    const toRight = pieces[y]?.[x + 1];

    if (piece.hasTop() && above?.hasBottom()) dfs(above, visted, x, y - 1, pieces);
    if (piece.hasBottom() && below?.hasTop()) dfs(below, visted, x, y + 1, pieces);
    if (piece.hasLeft() && toLeft?.hasRight()) dfs(toLeft, visted, x - 1, y, pieces);
    if (piece.hasRight() && toRight?.hasLeft()) dfs(toRight, visted, x + 1, y, pieces);
}

function startingState(): State {
    const startingRed = createPiece(PieceType.CORNER, -Math.PI / 2);
    startingRed.startingColor = PlayerColor.RED;

    const startingBlue = createPiece(PieceType.CORNER, Math.PI);
    startingBlue.startingColor = PlayerColor.BLUE;

    const startingYellow = createPiece(PieceType.CORNER, 0);
    startingYellow.startingColor = PlayerColor.YELLOW;

    const startingGreen = createPiece(PieceType.CORNER, Math.PI / 2);
    startingGreen.startingColor = PlayerColor.GREEN;

    const trophyTreasure = createPiece(PieceType.T, Math.PI, Treasure.TROPHY);
    const daggerTreasure = createPiece(PieceType.T, Math.PI, Treasure.DAGGER);
    const moneyBagTreasure = createPiece(PieceType.T, -Math.PI / 2, Treasure.MONEY_BAG);
    const keyTreasure = createPiece(PieceType.T, -Math.PI / 2, Treasure.KEY);
    const gemTreasure = createPiece(PieceType.T, Math.PI, Treasure.GEM);
    const shieldTreasure = createPiece(PieceType.T, Math.PI / 2, Treasure.SHIELD);
    const bookTreasure = createPiece(PieceType.T, -Math.PI / 2, Treasure.BOOK);
    const crownTreasure = createPiece(PieceType.T, 0, Treasure.CROWN);
    const toolboxTreasure = createPiece(PieceType.T, Math.PI / 2, Treasure.TOOLBOX);
    const candleTreasure = createPiece(PieceType.T, Math.PI / 2, Treasure.CANDLE);
    const bottleTreasure = createPiece(PieceType.T, 0, Treasure.BOTTLE);
    const ringTreasure = createPiece(PieceType.T, 0, Treasure.RING);

    const rotations = [0, Math.PI / 2, Math.PI, -Math.PI / 2];

    const pile = [
        createPiece(PieceType.T, getRandomElement(rotations), Treasure.MAGE),
        createPiece(PieceType.T, getRandomElement(rotations), Treasure.BAT),
        createPiece(PieceType.T, getRandomElement(rotations), Treasure.TROLL),
        createPiece(PieceType.T, getRandomElement(rotations), Treasure.DRAGON),
        createPiece(PieceType.T, getRandomElement(rotations), Treasure.GHOST),
        createPiece(PieceType.T, getRandomElement(rotations), Treasure.UNICORN),
        createPiece(PieceType.CORNER, getRandomElement(rotations), Treasure.OWL),
        createPiece(PieceType.CORNER, getRandomElement(rotations), Treasure.CAT),
        createPiece(PieceType.CORNER, getRandomElement(rotations), Treasure.BUTTERFLY),
        createPiece(PieceType.CORNER, getRandomElement(rotations), Treasure.MOUSE),
        createPiece(PieceType.CORNER, getRandomElement(rotations), Treasure.LIZARD),
        createPiece(PieceType.CORNER, getRandomElement(rotations), Treasure.SPIDER)
    ];

    for (let i = 0; i < CORNER_PIECES_IN_PILE; i++) {
        pile.push(createPiece(PieceType.CORNER, getRandomElement(rotations)));
    }

    for (let i = 0; i < STRAIGHT_PIECES_IN_PILE; i++) {
        pile.push(createPiece(PieceType.STRAIGHT, getRandomElement(rotations)));
    }

    return {
        pieces: [
            [startingRed, removeRandomElement(pile), trophyTreasure, removeRandomElement(pile), daggerTreasure, removeRandomElement(pile), startingBlue],
            [removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile)],
            [moneyBagTreasure, removeRandomElement(pile), keyTreasure, removeRandomElement(pile), gemTreasure, removeRandomElement(pile), shieldTreasure],
            [removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile)],
            [bookTreasure, removeRandomElement(pile), crownTreasure, removeRandomElement(pile), toolboxTreasure, removeRandomElement(pile), candleTreasure],
            [removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile)],
            [startingYellow, removeRandomElement(pile), bottleTreasure, removeRandomElement(pile), ringTreasure, removeRandomElement(pile), startingGreen]
        ],
        sparePiece: removeRandomElement(pile)
    };
}

export default Labyrinth;
