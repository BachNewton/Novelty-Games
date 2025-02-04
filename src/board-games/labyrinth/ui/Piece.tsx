import { Piece as PieceData, Treasure } from "../data/Piece";
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
import BatImage from '../images/treasures/bat.png';
import ButterflyImage from '../images/treasures/butterfly.png';
import CatImage from '../images/treasures/cat.png';
import DragonImage from '../images/treasures/dragon.png';
import GhostImage from '../images/treasures/ghost.png';
import LizardImage from '../images/treasures/lizard.png';
import MageImage from '../images/treasures/mage.png';
import MouseImage from '../images/treasures/mouse.png';
import OwlImage from '../images/treasures/owl.png';
import SpiderImage from '../images/treasures/spider.png';
import TrollImage from '../images/treasures/troll.png';
import UnicornImage from '../images/treasures/unicorn.png';
import { useRef, useState } from "react";
import { DraggingDetails } from "./Game";
import { coerceToRange } from "../../../util/Math";
import Circle from "./Circle";

interface PieceProps {
    data: PieceData,
    onClick: () => void;
    onMouseDown?: (event: React.MouseEvent) => void;
    draggingDetails: DraggingDetails | null;
    shouldBeDragged: () => boolean;
}

const Piece: React.FC<PieceProps> = ({ data, onClick, onMouseDown, draggingDetails, shouldBeDragged }) => {
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
        onMouseDown={onMouseDown}
    >
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

function centerIcon(data: PieceData): JSX.Element {
    if (data.startingColor !== null) {
        return <Circle color={data.startingColor} />
    }

    switch (data.treasure) {
        case Treasure.TROPHY:
            return image(TrophyImage);
        case Treasure.DAGGER:
            return image(DaggerImage);
        case Treasure.MONEY_BAG:
            return image(MoneyBagImage);
        case Treasure.BOOK:
            return image(BookImage);
        case Treasure.BOTTLE:
            return image(BottleImage);
        case Treasure.CANDLE:
            return image(CandleImage);
        case Treasure.CROWN:
            return image(CrownImage);
        case Treasure.GEM:
            return image(GemImage);
        case Treasure.KEY:
            return image(KeyImage);
        case Treasure.RING:
            return image(RingImage);
        case Treasure.SHIELD:
            return image(ShieldImage);
        case Treasure.TOOLBOX:
            return image(ToolboxImage);
        case Treasure.BAT:
            return image(BatImage);
        case Treasure.BUTTERFLY:
            return image(ButterflyImage);
        case Treasure.CAT:
            return image(CatImage);
        case Treasure.DRAGON:
            return image(DragonImage);
        case Treasure.GHOST:
            return image(GhostImage);
        case Treasure.LIZARD:
            return image(LizardImage);
        case Treasure.MAGE:
            return image(MageImage);
        case Treasure.MOUSE:
            return image(MouseImage);
        case Treasure.OWL:
            return image(OwlImage);
        case Treasure.SPIDER:
            return image(SpiderImage);
        case Treasure.TROLL:
            return image(TrollImage);
        case Treasure.UNICORN:
            return image(UnicornImage);
    }

    return <div />;
}

function brickUi(): JSX.Element {
    return image(BrickImage)
}

function image(src: string): JSX.Element {
    return <img src={src} draggable='false' />;
}

export default Piece;
