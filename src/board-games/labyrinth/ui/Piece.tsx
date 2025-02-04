import { Piece as PieceData } from "../data/Piece";
import BrickImage from '../images/brick.avif';
import { useRef, useState } from "react";
import { DraggingDetails, MousePosition } from "./Game";
import { coerceToRange } from "../../../util/Math";
import { getColor, Player, PlayerColor } from "../data/Player";
import { getTreasureImage } from "../data/Treasure";

interface PieceProps {
    data: PieceData;
    playerOnPiece: Player | null;
    onClick: () => void;
    onMouseDown?: (position: MousePosition) => void;
    draggingDetails: DraggingDetails | null;
    shouldBeDragged: () => boolean;
}

const Piece: React.FC<PieceProps> = ({ data, playerOnPiece, onClick, onMouseDown, draggingDetails, shouldBeDragged }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const top = data.hasTop() ? <div /> : brickUi();
    const bottom = data.hasBottom() ? <div /> : brickUi();
    const left = data.hasLeft() ? <div /> : brickUi();
    const right = data.hasRight() ? <div /> : brickUi();

    const style: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gridTemplateRows: 'repeat(3, 1fr)',
        margin: '1px',
        border: '1px solid grey',
        borderRadius: '15%',
        overflow: 'hidden',
        placeItems: 'stretch',
        userSelect: 'none',
        zIndex: 1,
        background: '#282C34'
    };

    if (draggingDetails !== null && shouldBeDragged() && ref.current !== null) {
        style.transform = calculateTranslation(draggingDetails, ref.current);
    }

    if (isHovered) {
        style.outline = '4px solid white';
    }

    if (data.isTraversable) {
        style.background = 'gold';
    }

    return <div
        ref={ref}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        onMouseDown={e => onMouseDown?.(handleMouseDown(e))}
        onTouchStart={e => onMouseDown?.(handleTouchStart(e))}
    >
        {brickUi()}
        {top}
        {brickUi()}
        {left}
        {centerIcon(data, playerOnPiece)}
        {right}
        {brickUi()}
        {bottom}
        {brickUi()}
    </div>;
};

function handleMouseDown(e: React.MouseEvent): MousePosition {
    return { x: e.clientX, y: e.clientY };
}

function handleTouchStart(e: React.TouchEvent): MousePosition {
    const touch = e.touches[0];

    return { x: touch.clientX, y: touch.clientY };
}

function calculateTranslation(draggingDetails: DraggingDetails, pieceComponent: HTMLDivElement): string {
    const size = pieceComponent.getBoundingClientRect().width;

    const xDiff = draggingDetails.position.y === 0 || draggingDetails.position.y === 4
        ? 0
        : draggingDetails.end.x - draggingDetails.start.x;

    const yDiff = draggingDetails.position.y > 0 && draggingDetails.position.y < 4
        ? 0
        : draggingDetails.end.y - draggingDetails.start.y;

    const x = draggingDetails.position.x === 0
        ? coerceToRange(xDiff, 0, size)
        : coerceToRange(xDiff, -size, 0);

    const y = draggingDetails.position.y === 0
        ? coerceToRange(yDiff, 0, size)
        : coerceToRange(yDiff, -size, 0);

    return `translate(${x}px, ${y}px)`;
}

function centerIcon(data: PieceData, playerOnPiece: Player | null): JSX.Element {
    const playerStyle = playerOnPiece ? getPlayerStyle(playerOnPiece.color) : {};

    if (data.treasure !== null) {
        return image(getTreasureImage(data.treasure), playerStyle);
    }

    return <div style={playerStyle} />;
}

function brickUi(): JSX.Element {
    return image(BrickImage);
}

function image(src: string, playerStyle?: React.CSSProperties): JSX.Element {
    return <img style={playerStyle} src={src} draggable='false' />;
}

function getPlayerStyle(color: PlayerColor): React.CSSProperties {
    return { borderRadius: '100%', background: getColor(color) };
}

export default Piece;
