import VerticalSpacer from "../../../util/ui/Spacer";
import { Card as CardData } from "../data/Card";
import { GameData } from "../data/GameData";
// import { AutoCircleLayout, CircleItem } from "./AutoCircleLayout";
import Card from "./Card";
// import CircleLayout, { CircleItem } from "./CircleLayout";

interface BoardProps {
    pot: number;
    cards: CardData[];
    data: GameData;
}

const Board: React.FC<BoardProps> = ({ pot, cards, data }) => {
    const playerUi = data.players.map((player, index) => <div key={index} style={{
        color: player.isTurn ? 'yellow' : undefined,
        fontWeight: player.isTurn ? 'bold' : undefined
    }}>
        {player.stack} - {player.name}: {player.lastAction} ({player.inPot})
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

        {/* <AutoCircleLayout ringGap={0} itemGap={0}>
            <CircleItem
                center={<div>Kyle</div>}
                middle={<div>Middle</div>}
                outer={<div>123</div>}
            />

            <CircleItem
                center={<div>Nick</div>}
                middle={<div>Middle</div>}
                outer={<div>456</div>}
            />

            <CircleItem
                center={<div>Landon</div>}
                middle={<div>Middle</div>}
                outer={<div>789</div>}
            />

            <CircleItem
                center={<div>Elliott</div>}
                middle={<div>Middle</div>}
                outer={<div>912</div>}
            />

            <CircleItem
                center={<div>Eric</div>}
                middle={<div>Middle</div>}
                outer={<div>234</div>}
            />
        </AutoCircleLayout> */}
    </div>;
};

export default Board;
