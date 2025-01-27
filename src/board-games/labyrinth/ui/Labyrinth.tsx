import { useEffect, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import { getRandomElement } from "../../../util/Randomizer";
import BrickImage from '../images/brick.avif';

interface Piece {
    paths: number[];
    rotation: number;
}

const STRAIGHT_PIECE: Piece = {
    paths: [0, Math.PI],
    rotation: 0
};

const CORNER_PIECE: Piece = {
    paths: [0, Math.PI / 2],
    rotation: 0
};

const T_PIECE: Piece = {
    paths: [0, Math.PI / 2, Math.PI],
    rotation: 0
};

const Labyrinth: React.FC = () => {
    const [pieces, setPieces] = useState(startingPieces());

    useEffect(() => {
        updateRoute(Route.LABYRINTH);
    }, []);

    const piecesUi = pieces.flatMap(rowPieces => rowPieces).map((piece, index) => {
        return pieceUi(piece, index);
    });

    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(7, 1fr)', aspectRatio: 1, maxHeight: '100vh' }}>
            {piecesUi}
        </div>
    </div>;
};

function pieceUi(piece: Piece, key: number): JSX.Element {
    const coordinates = piece.paths.map(path => {
        const x = Math.cos(path + piece.rotation);
        const y = Math.sin(path + piece.rotation);

        return { x: Math.round(x), y: Math.round(y) };
    });

    const top = coordinates.find(coordinate => coordinate.x === 0 && coordinate.y === 1) === undefined
        ? brickUi()
        : <div></div>;

    const bottom = coordinates.find(coordinate => coordinate.x === 0 && coordinate.y === -1) === undefined
        ? brickUi()
        : <div></div>;

    const left = coordinates.find(coordinate => coordinate.x === -1 && coordinate.y === 0) === undefined
        ? brickUi()
        : <div></div>;

    const right = coordinates.find(coordinate => coordinate.x === 1 && coordinate.y === 0) === undefined
        ? brickUi()
        : <div></div>;

    return <div key={key} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gridTemplateRows: 'repeat(3, 1fr)',
        margin: '1px',
        border: '1px solid grey',
        borderRadius: '15%',
        overflow: 'hidden',
        placeItems: 'stretch'
    }}>
        {brickUi()}
        {top}
        {brickUi()}
        {left}
        <div></div>
        {right}
        {brickUi()}
        {bottom}
        {brickUi()}
    </div>;
}

function startingPieces(): Piece[][] {
    return [
        [{ ...CORNER_PIECE }, randomPiece(), { ...T_PIECE }, randomPiece(), { ...T_PIECE }, randomPiece(), { ...CORNER_PIECE }],
        [randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece()],
        [{ ...T_PIECE }, randomPiece(), { ...T_PIECE }, randomPiece(), { ...T_PIECE }, randomPiece(), { ...T_PIECE }],
        [randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece()],
        [{ ...T_PIECE }, randomPiece(), { ...T_PIECE }, randomPiece(), { ...T_PIECE }, randomPiece(), { ...T_PIECE }],
        [randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece()],
        [{ ...CORNER_PIECE }, randomPiece(), { ...T_PIECE }, randomPiece(), { ...T_PIECE }, randomPiece(), { ...CORNER_PIECE }]
    ];
}

function randomPiece(): Piece {
    const pieceTypes = [{ ...CORNER_PIECE }, { ...T_PIECE }, { ...STRAIGHT_PIECE }];
    const rotations = [0, Math.PI / 2, Math.PI, -Math.PI / 2];

    const piece = getRandomElement(pieceTypes);
    piece.rotation += getRandomElement(rotations);

    return piece;
}

function brickUi(): JSX.Element {
    return <img src={BrickImage} />
}

export default Labyrinth;
