import { Card as CardData } from "../logic/Card";

interface CardProps {
    card: CardData;
}

const Card: React.FC<CardProps> = ({ card }) => {
    return <div style={{ flexGrow: 1 }}>
        <img src={card.image} style={{ maxWidth: '100%' }} />
    </div>
}

export default Card;
