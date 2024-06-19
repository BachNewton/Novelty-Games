import { Card as CardData } from "../logic/Card";
import MB_OUTLINE from "../images/MB-outline.svg";

interface CardProps {
    card: CardData | null;
    translateY?: number;
    onClick?: () => void;
    isHighlighted?: boolean;
}

const Card: React.FC<CardProps> = ({ card, translateY, onClick, isHighlighted }) => {
    const style: React.CSSProperties = {
        flexGrow: 1,
        transform: `translateY(${translateY || 0}%)`,
    };

    if (isHighlighted) {
        style.borderColor = 'yellow';
        style.borderWidth = '3px';
        style.borderStyle = 'solid';
        style.boxSizing = 'border-box';
    }

    return <div style={style}>
        <img src={card?.image || MB_OUTLINE} style={{ maxWidth: '100%' }} onClick={onClick} />
    </div>
}

export default Card;
