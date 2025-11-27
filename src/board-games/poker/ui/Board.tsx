import VerticalSpacer from "../../../util/ui/Spacer";
import { Card as CardData } from "../data/Card";
import { GameData } from "../data/GameData";
import Card from "./Card";

interface BoardProps {
    pot: number;
    cards: CardData[];
    data: GameData;
}

const Board: React.FC<BoardProps> = ({ pot, cards, data }) => {
    const playerUi = data.players.map((player, index) => <div key={index}>
        {player.name}:
    </div>);

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

        <VerticalSpacer height={15} />

        {playerUi}
    </div>;
};

export default Board;
