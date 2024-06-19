import { Card as CardData } from "../logic/Card";
import MB_OUTLINE from "../images/MB-outline.svg";

interface CardProps {
    card: CardData | null;
    translateY?: number;
}

const Card: React.FC<CardProps> = ({ card, translateY }) => {
    return <div style={{ flexGrow: 1, transform: `translateY(${translateY || 0}%)` }}>
        <img src={card?.image || MB_OUTLINE} style={{ maxWidth: '100%' }} />
    </div>
}

export default Card;
