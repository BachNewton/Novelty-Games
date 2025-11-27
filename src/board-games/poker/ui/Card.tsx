import { Card as CardData, Suit } from "../data/Card";

interface CardProps {
    data: CardData | null;
}

const Card: React.FC<CardProps> = ({ data }) => {
    const content = data === null
        ? <></>
        : <div style={{
            color: getColor(data)
        }}>{data.rank} {getSuitSymbol(data)}</div>;

    return <div style={{
        fontSize: '2em',
        border: '1px solid black',
        borderRadius: '15px',
        padding: '10px',
        backgroundColor: 'white',
        width: '4ch',
        textAlign: 'center'
    }}>
        {content}
    </div>;
};

function getColor(data: CardData): string {
    switch (data.suit) {
        case Suit.HEARTS:
        case Suit.DIAMONDS:
            return 'red';
        case Suit.CLUBS:
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
