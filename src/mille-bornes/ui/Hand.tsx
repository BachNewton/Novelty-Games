import { Card } from "../logic/Card";
import CardUi from "./Card";

interface HandProps {
    hand: Array<Card>;
    onPlayCard: (card: Card) => void;
    highlightedCard: Card | null;
    greyedOut: boolean;
}

const Hand: React.FC<HandProps> = ({ hand, onPlayCard, highlightedCard, greyedOut }) => {
    const cards = hand.map((card, index) => <CardUi
        card={card}
        key={index}
        onClick={() => onPlayCard(card)}
        isHighlighted={card === highlightedCard}
        objectPosition={'bottom'}
    />);

    return <div style={{ display: 'grid', gridAutoFlow: 'column', minHeight: 0, opacity: greyedOut ? 0.1 : 1 }}>
        {cards}
    </div>
}

export default Hand;
