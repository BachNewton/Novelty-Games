import { Card as CardData, Suit } from "../data/Card";

interface CardProps {
    data: CardData | null;
}

const Card: React.FC<CardProps> = ({ data }) => {
    const content = data === null
        ? <div>?</div>
        : <div style={{
            color: getColor(data)
        }}>{data.rank} {getSuitSymbol(data)}</div>;

    return <div style={{
        fontSize: '1.25em',
        fontWeight: 'bold',
        border: '3px solid black',
        borderRadius: '15px',
        padding: '5px',
        backgroundColor: data === null ? 'grey' : 'white',
        width: '4ch',
        textAlign: 'center'
    }}>
        {content}
    </div>;
};

function getColor(data: CardData): string {
    switch (data.suit) {
        case Suit.HEARTS:
            return 'red';
        case Suit.DIAMONDS:
            return 'blue';
        case Suit.CLUBS:
            return 'green';
        case Suit.SPADES:
            return 'black';
    }
}

function getSuitSymbol(data: CardData): string {
    switch (data.suit) {
        case Suit.HEARTS:
            return '♥';
        case Suit.DIAMONDS:
            return '♦';
        case Suit.CLUBS:
            return '♣';
        case Suit.SPADES:
            return '♠';
    }
}

export default Card;
