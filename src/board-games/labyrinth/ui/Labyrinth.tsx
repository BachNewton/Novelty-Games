import { useEffect, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import { getRandomElement } from "../../../util/Randomizer";
import { Piece, CORNER_PIECE, PlayerColor, T_PIECE, STRAIGHT_PIECE, Treasure } from "../data/Piece";
import PieceUi from "./Piece";

const Labyrinth: React.FC = () => {
    const [pieces, setPieces] = useState(startingPieces());

    useEffect(() => {
        updateRoute(Route.LABYRINTH);
    }, []);

    const piecesUi = pieces.flatMap(rowPieces => rowPieces).map((piece, index) => {
        return <PieceUi key={index} data={piece} onClick={() => temp(index, piece, pieces)} />;
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

function temp(index: number, piece: Piece, pieces: Piece[][]) {
    const cols = pieces[0].length;
    const x = Math.floor(index / cols);
    const y = index % cols;

    console.log(x, y);

    //
}

function startingPieces(): Piece[][] {
    const startingRed = { ...CORNER_PIECE };
    startingRed.startingColor = PlayerColor.RED;
    startingRed.rotate(-Math.PI / 2);

    const startingBlue = { ...CORNER_PIECE };
    startingBlue.startingColor = PlayerColor.BLUE;
    startingBlue.rotate(Math.PI);

    const startingYellow = { ...CORNER_PIECE };
    startingYellow.startingColor = PlayerColor.YELLOW;

    const startingGreen = { ...CORNER_PIECE };
    startingGreen.startingColor = PlayerColor.GREEN;
    startingGreen.rotate(Math.PI / 2);

    const trophyTreasure = { ...T_PIECE };
    trophyTreasure.treasure = Treasure.TROPHY;
    trophyTreasure.rotate(Math.PI);

    const daggerTreasure = { ...T_PIECE };
    daggerTreasure.treasure = Treasure.DAGGER;
    daggerTreasure.rotate(Math.PI);

    const moneyBagTreasure = { ...T_PIECE };
    moneyBagTreasure.treasure = Treasure.MONEY_BAG;
    moneyBagTreasure.rotate(-Math.PI / 2);

    return [
        [startingRed, randomPiece(), trophyTreasure, randomPiece(), daggerTreasure, randomPiece(), startingBlue],
        [randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece()],
        [moneyBagTreasure, randomPiece(), { ...T_PIECE }, randomPiece(), { ...T_PIECE }, randomPiece(), { ...T_PIECE }],
        [randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece()],
        [{ ...T_PIECE }, randomPiece(), { ...T_PIECE }, randomPiece(), { ...T_PIECE }, randomPiece(), { ...T_PIECE }],
        [randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece()],
        [startingYellow, randomPiece(), { ...T_PIECE }, randomPiece(), { ...T_PIECE }, randomPiece(), startingGreen]
    ];
}

function randomPiece(): Piece {
    const pieceTypes = [{ ...CORNER_PIECE }, { ...T_PIECE }, { ...STRAIGHT_PIECE }];
    const rotations = [0, Math.PI / 2, Math.PI, -Math.PI / 2];

    const piece = getRandomElement(pieceTypes);
    piece.rotate(getRandomElement(rotations));

    return piece;
}

export default Labyrinth;
