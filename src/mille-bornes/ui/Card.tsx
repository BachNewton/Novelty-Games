import { Card as CardData } from "../logic/Card";
import MB_OUTLINE from "../images/MB-outline.svg";
import MB_BACK from "../images/MB-back.svg";

interface CardProps {
    card?: CardData | null;
    onClick?: () => void;
    isHighlighted?: boolean;
    transform?: string;
}

const Card: React.FC<CardProps> = ({ card, onClick, isHighlighted, transform }) => {
    const imgStyle: React.CSSProperties = {
        minHeight: 0,
        height: '100%',
        objectFit: 'contain',
        width: '100%',
        objectPosition: 'bottom',
        transform: transform
    };

    if (isHighlighted) {
        imgStyle.borderColor = 'yellow';
        imgStyle.borderWidth = '3px';
        imgStyle.borderStyle = 'solid';
        imgStyle.boxSizing = 'border-box';
    }

    const src = card === undefined ? MB_BACK : card === null ? MB_OUTLINE : card.image;

    // TODO: transform: rotate(90deg);
    return <img src={src} style={imgStyle} onClick={onClick} />;
}

export default Card;
