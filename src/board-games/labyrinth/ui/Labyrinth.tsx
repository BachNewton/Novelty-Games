import { useEffect, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";

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

    const piecesUi = pieces.flatMap(rowPieces => rowPieces.map(piece => {
        return pieceUi(piece);
    }));

    console.log(piecesUi);

    return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: 'repeat(3, 1fr)', height: '100vh' }}>
        {piecesUi}
    </div>;
};

function pieceUi(piece: Piece): JSX.Element {
    const coordinates = piece.paths.map(path => {
        const x = Math.cos(path + piece.rotation);
        const y = Math.sin(path + piece.rotation);

        return { x: Math.floor(x), y: Math.floor(y) };
    });

    const top = coordinates.find(coordinate => coordinate.x === 0 && coordinate.y === 1) === undefined
        ? <div style={{ background: 'blue' }}></div>
        : <div></div>;

    const bottom = coordinates.find(coordinate => coordinate.x === 0 && coordinate.y === -1) === undefined
        ? <div style={{ background: 'magenta' }}></div>
        : <div></div>;

    const left = coordinates.find(coordinate => coordinate.x === -1 && coordinate.y === 0) === undefined
        ? <div style={{ background: 'green' }}></div>
        : <div></div>;

    const right = coordinates.find(coordinate => coordinate.x === 1 && coordinate.y === 0) === undefined
        ? <div style={{ background: 'orange' }}></div>
        : <div></div>;

    return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: 'repeat(3, 1fr)', margin: '5px', border: '2px solid white' }}>
        <div style={{ background: 'white' }}></div>
        {top}
        <div style={{ background: 'red' }}></div>
        {left}
        <div></div>
        {right}
        <div style={{ background: 'black' }}></div>
        {bottom}
        <div style={{ background: 'teal' }}></div>
    </div>;
}

function startingPieces(): Piece[][] {
    return [
        [{ ...CORNER_PIECE }, { ...T_PIECE }, { ...T_PIECE }],
        [{ ...T_PIECE }, { ...T_PIECE }, { ...T_PIECE }],
        [{ ...T_PIECE }, { ...STRAIGHT_PIECE }, { ...T_PIECE }]
    ];
}

export default Labyrinth;
