import { Piece as PieceData, PlayerColor, Treasure } from "../data/Piece";
import BrickImage from '../images/brick.avif';
import TrophyImage from '../images/treasures/trophy.png';
import DaggerImage from '../images/treasures/dagger.png';
import MoneyBagImage from '../images/treasures/money-bag.png';
import BookImage from '../images/treasures/book.png';
import BottleImage from '../images/treasures/bottle.png';
import CandleImage from '../images/treasures/candle.png';
import CrownImage from '../images/treasures/crown.png';
import GemImage from '../images/treasures/gem.png';
import KeyImage from '../images/treasures/key.png';
import RingImage from '../images/treasures/ring.png';
import ShieldImage from '../images/treasures/shield.png';
import ToolboxImage from '../images/treasures/toolbox.png';
import { useState } from "react";

interface PieceProps {
    data: PieceData,
    onClick: () => void;
}

const Piece: React.FC<PieceProps> = ({ data, onClick }) => {
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
        placeItems: 'stretch'
    };

    if (isHovered) {
        style.outline = '4px solid white';
    }

    if (data.isTraversable) {
        style.background = 'gold';
    }

    return <div style={style} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={onClick}>
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
        case Treasure.BOOK:
            return <img src={BookImage} />;
        case Treasure.BOTTLE:
            return <img src={BottleImage} />;
        case Treasure.CANDLE:
            return <img src={CandleImage} />;
        case Treasure.CROWN:
            return <img src={CrownImage} />;
        case Treasure.GEM:
            return <img src={GemImage} />;
        case Treasure.KEY:
            return <img src={KeyImage} />;
        case Treasure.RING:
            return <img src={RingImage} />;
        case Treasure.SHIELD:
            return <img src={ShieldImage} />;
        case Treasure.TOOLBOX:
            return <img src={ToolboxImage} />;
    }

    return <div />;
}

function brickUi(): JSX.Element {
    return <img src={BrickImage} />
}

export default Piece;
