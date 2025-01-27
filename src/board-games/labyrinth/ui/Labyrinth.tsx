import { useEffect, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import { getRandomElement } from "../../../util/Randomizer";
import BrickImage from '../images/brick.avif';

enum PlayerColor {
    RED, BLUE, YELLOW, GREEN
}

interface Piece {
    paths: number[];
    rotation: number;
    startingColor: PlayerColor | null;
}

const STRAIGHT_PIECE: Piece = {
    paths: [0, Math.PI],
    rotation: 0,
    startingColor: null
};

const CORNER_PIECE: Piece = {
    paths: [0, Math.PI / 2],
    rotation: 0,
    startingColor: null
};

const T_PIECE: Piece = {
    paths: [0, Math.PI / 2, Math.PI],
    rotation: 0,
    startingColor: null
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
        {centerIcon(piece)}
        {right}
        {brickUi()}
        {bottom}
        {brickUi()}
    </div>;
}

function startingPieces(): Piece[][] {
    const startingRed = { ...CORNER_PIECE };
    startingRed.startingColor = PlayerColor.RED;
    startingRed.rotation -= Math.PI / 2;

    const startingBlue = { ...CORNER_PIECE };
    startingBlue.startingColor = PlayerColor.BLUE;
    startingBlue.rotation += Math.PI;

    const startingYellow = { ...CORNER_PIECE };
    startingYellow.startingColor = PlayerColor.YELLOW;

    const startingGreen = { ...CORNER_PIECE };
    startingGreen.startingColor = PlayerColor.GREEN;
    startingGreen.rotation += Math.PI / 2;

    return [
        [startingRed, randomPiece(), { ...T_PIECE }, randomPiece(), { ...T_PIECE }, randomPiece(), startingBlue],
        [randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece()],
        [{ ...T_PIECE }, randomPiece(), { ...T_PIECE }, randomPiece(), { ...T_PIECE }, randomPiece(), { ...T_PIECE }],
        [randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece()],
        [{ ...T_PIECE }, randomPiece(), { ...T_PIECE }, randomPiece(), { ...T_PIECE }, randomPiece(), { ...T_PIECE }],
        [randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece(), randomPiece()],
        [startingYellow, randomPiece(), { ...T_PIECE }, randomPiece(), { ...T_PIECE }, randomPiece(), startingGreen]
    ];
}

function centerIcon(piece: Piece): JSX.Element {
    const margin = '5px';

    switch (piece.startingColor) {
        case PlayerColor.RED:
            return <div style={{ borderRadius: '100%', margin: margin, background: 'red' }} />;
        case PlayerColor.BLUE:
            return <div style={{ borderRadius: '100%', margin: margin, background: 'blue' }} />;
        case PlayerColor.YELLOW:
            return <div style={{ borderRadius: '100%', margin: margin, background: 'yellow' }} />;
        case PlayerColor.GREEN:
            return <div style={{ borderRadius: '100%', margin: margin, background: 'green' }} />;
        case null:
            return <div />;;
    }
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
