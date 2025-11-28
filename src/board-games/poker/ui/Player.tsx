import { Player as PlayerData } from "../data/Player";
import Card from "./Card";

interface PlayerProps {
    data: PlayerData
}

const Player: React.FC<PlayerProps> = ({ data }) => {
    return <div style={{
        border: `1px solid ${data.isTurn ? 'yellow' : 'grey'}`,
        borderRadius: '15px',
        padding: '7px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)'
    }}>
        <div>
            <div>{data.name}</div>
            <div>{data.stack}</div>
        </div>

        <div style={{
            display: 'flex',
            gap: '5px'
        }}>
            <Card data={data.showCards ? data.card1 : null} />
            <Card data={data.showCards ? data.card2 : null} />
        </div>

        <div style={{ textAlign: 'right' }}>
            <div>{data.inPot}</div>
            <div>{data.lastAction}</div>
        </div>
    </div>;
};

export default Player;
