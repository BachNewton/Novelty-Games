import VerticalSpacer from "../../../util/ui/Spacer";
import { Card as CardData } from "../data/Card";
import Card from "./Card";

interface BoardProps {
    pot: number;
    cards: CardData[];
}

const Board: React.FC<BoardProps> = ({ pot, cards }) => {
    const cardsUi = cards.map((card, index) => <Card key={index} data={card} />);

    return <div style={{
        backgroundColor: 'darkgreen',
        padding: '15px',
        borderRadius: '25px',
        border: '3px solid black'
    }}>
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px'
        }}>
            <Card data={cards[0] ?? null} />
            <Card data={cards[1] ?? null} />
            <Card data={cards[2] ?? null} />
            <Card data={cards[3] ?? null} />
            <Card data={cards[4] ?? null} />
        </div>

        <VerticalSpacer height={15} />

        <div style={{
            fontSize: '2em',
            textAlign: 'center'
        }}>Pot: {pot}</div>
    </div>;
};

export default Board;
