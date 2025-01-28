import { useEffect, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import { getRandomElement } from "../../../util/Randomizer";
import { createPiece, Piece, PieceType, PlayerColor, Treasure } from "../data/Piece";
import PieceUi from "./Piece";

const Labyrinth: React.FC = () => {
    const [pieces, setPieces] = useState(() => startingPieces());

    useEffect(() => {
        updateRoute(Route.LABYRINTH);
    }, []);

    const piecesUi = pieces.flatMap(rowPieces => rowPieces).map((piece, index) => {
        return <PieceUi key={index} data={piece} onClick={() => {
            highlightPaths(index, piece, pieces);
            setPieces(pieces.map(row => [...row]));
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

function startingPieces(): Piece[][] {
    const startingRed = createPiece(PieceType.CORNER);
    startingRed.startingColor = PlayerColor.RED;
    startingRed.rotate(-Math.PI / 2);

    const startingBlue = createPiece(PieceType.CORNER);
    startingBlue.startingColor = PlayerColor.BLUE;
    startingBlue.rotate(Math.PI);

    const startingYellow = createPiece(PieceType.CORNER);
    startingYellow.startingColor = PlayerColor.YELLOW;

    const startingGreen = createPiece(PieceType.CORNER);
    startingGreen.startingColor = PlayerColor.GREEN;
    startingGreen.rotate(Math.PI / 2);

    const trophyTreasure = createPiece(PieceType.T);
    trophyTreasure.treasure = Treasure.TROPHY;
    trophyTreasure.rotate(Math.PI);

    const daggerTreasure = createPiece(PieceType.T);
    daggerTreasure.treasure = Treasure.DAGGER;
    daggerTreasure.rotate(Math.PI);

    const moneyBagTreasure = createPiece(PieceType.T);
    moneyBagTreasure.treasure = Treasure.MONEY_BAG;
    moneyBagTreasure.rotate(-Math.PI / 2);

    const keyTreasure = createPiece(PieceType.T);
    keyTreasure.treasure = Treasure.KEY;
    keyTreasure.rotate(-Math.PI / 2);

    const gemTreasure = createPiece(PieceType.T);
    gemTreasure.treasure = Treasure.GEM;
    gemTreasure.rotate(Math.PI);

    const shieldTreasure = createPiece(PieceType.T);
    shieldTreasure.treasure = Treasure.SHIELD;
    shieldTreasure.rotate(Math.PI / 2);

    const bookTreasure = createPiece(PieceType.T);
    bookTreasure.treasure = Treasure.BOOK;
    bookTreasure.rotate(-Math.PI / 2);

    const crownTreasure = createPiece(PieceType.T);
    crownTreasure.treasure = Treasure.CROWN;

    const toolboxTreasure = createPiece(PieceType.T);
    toolboxTreasure.treasure = Treasure.TOOLBOX;
    toolboxTreasure.rotate(Math.PI / 2);

    const candleTreasure = createPiece(PieceType.T);
    candleTreasure.treasure = Treasure.CANDLE;
    candleTreasure.rotate(Math.PI / 2);

    const bottleTreasure = createPiece(PieceType.T);
    bottleTreasure.treasure = Treasure.BOTTLE;

    const ringTreasure = createPiece(PieceType.T);
    ringTreasure.treasure = Treasure.RING;

    return [
        [startingRed, randomPiece(), trophyTreasure, randomPiece(), daggerTreasure, randomPiece(), startingBlue],
        [randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece()],
        [moneyBagTreasure, randomPiece(), keyTreasure, randomPiece(), gemTreasure, randomPiece(), shieldTreasure],
        [randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece()],
        [bookTreasure, randomPiece(), crownTreasure, randomPiece(), toolboxTreasure, randomPiece(), candleTreasure],
        [randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece()],
        [startingYellow, randomPiece(), bottleTreasure, randomPiece(), ringTreasure, randomPiece(), startingGreen]
    ];
}

function randomPiece(): Piece {
    const pieceTypes = [createPiece(PieceType.CORNER), createPiece(PieceType.T), createPiece(PieceType.STRAIGHT)];
    const rotations = [0, Math.PI / 2, Math.PI, -Math.PI / 2];

    const piece = getRandomElement(pieceTypes);
    piece.rotate(getRandomElement(rotations));

    return piece;
}

export default Labyrinth;
