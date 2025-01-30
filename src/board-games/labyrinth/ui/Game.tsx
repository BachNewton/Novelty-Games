import { useEffect, useState } from "react";
import { Piece } from "../data/Piece";
import PieceUi from "./Piece";
import Triangle from "./Triangle";
import { createStartingState } from "../logic/GameSetup";

export interface State {
    pieces: Piece[][];
    sparePiece: SparePiece;
}

interface SparePiece {
    piece: Piece;
    position: TrianglePosition;
}

interface TrianglePosition {
    x: number;
    y: number;
}

export interface DraggingDetails {
    start: MousePosition;
    end: MousePosition;
    position: TrianglePosition;
}

interface MousePosition {
    x: number;
    y: number;
}

interface Array2DPosition {
    x: number;
    y: number;
}

const Game: React.FC = () => {
    const [state, setState] = useState<State>(createStartingState());
    const [draggingDetails, setDraggingDetails] = useState<DraggingDetails | null>(null);

    useEffect(() => {
        const mouseMoveListener = (e: MouseEvent) => {
            if (draggingDetails === null) return;

            setDraggingDetails({ start: draggingDetails.start, end: { x: e.clientX, y: e.clientY }, position: state.sparePiece.position });
        };

        const mouseUpListener = () => setDraggingDetails(null);

        window.addEventListener('mousemove', mouseMoveListener);
        window.addEventListener('mouseup', mouseUpListener);

        return () => {
            window.removeEventListener('mousemove', mouseMoveListener);
            window.removeEventListener('mouseup', mouseUpListener);
        };
    }, [draggingDetails]);

    const piecesUi = state.pieces.flatMap(rowPieces => rowPieces).map((piece, index) => {
        return <PieceUi
            key={index}
            data={piece}
            draggingDetails={draggingDetails}
            shouldBeDragged={() => shouldBeDragged(index, state.pieces, draggingDetails)}
            onClick={() => {
                highlightPaths(index, piece, state.pieces);

                setState({
                    pieces: state.pieces.map(row => [...row]),
                    sparePiece: state.sparePiece
                });
            }}
        />;
    });

    const onTriangleClick = (x: number, y: number) => {
        setState({
            pieces: state.pieces,
            sparePiece: {
                piece: state.sparePiece.piece,
                position: { x: x, y: y }
            }
        });
    };

    const triangles = [
        [0, 0, 0],
        [-90, 90],
        [-90, 90],
        [-90, 90],
        [180, 180, 180],
    ].map((row, y) => row.map((col, x) => <Triangle rotation={col} onClick={() => onTriangleClick(x, y)} />));

    triangles[state.sparePiece.position.y][state.sparePiece.position.x] = <PieceUi
        data={state.sparePiece.piece}
        onClick={() => { }}
        onMouseDown={e => setDraggingDetails({
            start: { x: e.clientX, y: e.clientY },
            end: { x: e.clientX, y: e.clientY },
            position: state.sparePiece.position
        })}
        draggingDetails={draggingDetails}
        shouldBeDragged={() => true}
    />;

    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(9, 1fr)',
            gridTemplateRows: 'repeat(9, 1fr)',
            aspectRatio: 1,
            maxHeight: '100vh',
            boxSizing: 'border-box',
            padding: '10px'
        }}>
            <div /><div />{triangles[0][0]}<div />{triangles[0][1]}<div />{triangles[0][2]}<div /><div />
            <div />{piecesUi.slice(7 * 0, 7 * 1)}<div />
            {triangles[1][0]}{piecesUi.slice(7 * 1, 7 * 2)}{triangles[1][1]}
            <div />{piecesUi.slice(7 * 2, 7 * 3)}<div />
            {triangles[2][0]}{piecesUi.slice(7 * 3, 7 * 4)}{triangles[2][1]}
            <div />{piecesUi.slice(7 * 4, 7 * 5)}<div />
            {triangles[3][0]}{piecesUi.slice(7 * 5, 7 * 6)}{triangles[3][1]}
            <div />{piecesUi.slice(7 * 6, 7 * 7)}<div />
            <div /><div />{triangles[4][0]}<div />{triangles[4][1]}<div />{triangles[4][2]}<div /><div />
        </div>
    </div>;
};

function shouldBeDragged(index: number, pieces: Piece[][], draggingDetails: DraggingDetails | null): boolean {
    if (draggingDetails === null) return false;

    const position = calculate2DArrayPosition(index, pieces);
    const { x, y } = draggingDetails.position;

    const xMappings: Record<number, number> = { 0: 1, 1: 3, 2: 5 };
    const yMappings: Record<number, number> = { 1: 1, 2: 3, 3: 5 };

    if ((y === 0 || y === 4) && xMappings[x] === position.x) return true;
    if (yMappings[y] === position.y) return true;

    return false;
}

function calculate2DArrayPosition(index: number, pieces: Piece[][]): Array2DPosition {
    const cols = pieces[0].length;
    const y = Math.floor(index / cols);
    const x = index % cols;

    return { x: x, y: y };
}

function highlightPaths(index: number, piece: Piece, pieces: Piece[][]) {
    pieces.forEach(row => row.forEach(col => col.isTraversable = false));

    const position = calculate2DArrayPosition(index, pieces);

    dfs(piece, new Set(), position.x, position.y, pieces);
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

export default Game;
