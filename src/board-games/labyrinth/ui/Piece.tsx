import { Piece as PieceData, PlayerColor, Treasure } from "../data/Piece";
import BrickImage from '../images/brick.avif';
import TrophyImage from '../images/treasures/trophy.png';
import DaggerImage from '../images/treasures/dagger.png';
import MoneyBagImage from '../images/treasures/money-bag.png';
import { useState } from "react";

interface PieceProps {
    data: PieceData
}

const Piece: React.FC<PieceProps> = ({ data }) => {
    const [isHovered, setIsHovered] = useState(false);

    const coordinates = data.paths.map(path => {
        const x = Math.cos(path + data.rotation);
        const y = Math.sin(path + data.rotation);

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

    const style: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gridTemplateRows: 'repeat(3, 1fr)',
        margin: '1px',
        border: '1px solid grey',
        borderRadius: '15%',
        overflow: 'hidden',
        placeItems: 'stretch'
    };

    if (isHovered) {
        style.outline = '4px solid white';
    }

    return <div style={style} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        {brickUi()}
        {top}
        {brickUi()}
        {left}
        {centerIcon(data)}
        {right}
        {brickUi()}
        {bottom}
        {brickUi()}
    </div>;
};

function centerIcon(data: PieceData): JSX.Element {
    const margin = '5px';

    switch (data.startingColor) {
        case PlayerColor.RED:
            return <div style={{ borderRadius: '100%', margin: margin, background: 'red' }} />;
        case PlayerColor.BLUE:
            return <div style={{ borderRadius: '100%', margin: margin, background: 'blue' }} />;
        case PlayerColor.YELLOW:
            return <div style={{ borderRadius: '100%', margin: margin, background: 'yellow' }} />;
        case PlayerColor.GREEN:
            return <div style={{ borderRadius: '100%', margin: margin, background: 'green' }} />;
    }

    switch (data.treasure) {
        case Treasure.TROPHY:
            return <img src={TrophyImage} />;
        case Treasure.DAGGER:
            return <img src={DaggerImage} />;
        case Treasure.MONEY_BAG:
            return <img src={MoneyBagImage} />;
    }

    return <div />;
}

function brickUi(): JSX.Element {
    return <img src={BrickImage} />
}

export default Piece;
