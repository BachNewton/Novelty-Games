import { Card as CardData } from "../logic/Card";
import MB_OUTLINE from "../images/MB-outline.svg";
import MB_BACK from "../images/MB-back.svg";

interface CardProps {
    card?: CardData | null;
    onClick?: () => void;
    isHighlighted?: boolean;
    transform?: string;
    objectPosition?: string;
    isGreyedOut?: boolean;
}

const Card: React.FC<CardProps> = ({ card, onClick, isHighlighted, transform, objectPosition, isGreyedOut }) => {
    const imgStyle: React.CSSProperties = {
        minHeight: 0,
        height: '100%',
        objectFit: 'contain',
        width: '100%',
        objectPosition: objectPosition || 'top',
        transform: transform,
        opacity: isGreyedOut ? 0.45 : 1
    };

    if (isHighlighted) {
        imgStyle.borderColor = 'yellow';
        imgStyle.borderWidth = '3px';
        imgStyle.borderStyle = 'solid';
        imgStyle.boxSizing = 'border-box';
    }

    const src = card === undefined ? MB_BACK : card === null ? MB_OUTLINE : card.image;

    return <img src={src} style={imgStyle} onClick={onClick} alt='Card' />;
}

export default Card;
