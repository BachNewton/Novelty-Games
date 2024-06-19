import { Card as CardData } from "../logic/Card";
import MB_OUTLINE from "../images/MB-outline.svg";
import MB_BACK from "../images/MB-back.svg";

interface CardProps {
    card?: CardData | null;
    translateY?: number;
    onClick?: () => void;
    isHighlighted?: boolean;
}

const Card: React.FC<CardProps> = ({ card, translateY, onClick, isHighlighted }) => {
    const imgStyle: React.CSSProperties = { maxWidth: '100%', height: '100%' };

    if (isHighlighted) {
        imgStyle.borderColor = 'yellow';
        imgStyle.borderWidth = '3px';
        imgStyle.borderStyle = 'solid';
        imgStyle.boxSizing = 'border-box';
    }

    const src = card === undefined ? MB_BACK : card === null ? MB_OUTLINE : card.image;

    return <div style={{ flexGrow: 1, transform: `translateY(${translateY || 0}%)` }}>
        <img src={src} style={imgStyle} onClick={onClick} />
    </div>
}

export default Card;
