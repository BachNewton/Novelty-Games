import '../css/Cards.css';
import { useState } from 'react';
import { Card } from "../logic/Card";
import CardUi from "./Card";

interface HandProps {
    hand: Array<Card>;
    onPlayCard: (card: Card) => void;
}

const Hand: React.FC<HandProps> = ({ hand, onPlayCard }) => {
    const [hightlightedCard, setHighlightedCard] = useState<Card | null>(null);

    const cards = hand.map((card, index) => {
        const onClick = () => {
            if (card === hightlightedCard) {
                setHighlightedCard(null);
                onPlayCard(card);
            } else {
                setHighlightedCard(card);
            }
        };

        return <CardUi card={card} key={index} onClick={onClick} isHighlighted={card === hightlightedCard} />
    });

    return <div style={{ minHeight: 0, display: 'flex' }} className="cards">
        {cards}
    </div>;
}

export default Hand;
