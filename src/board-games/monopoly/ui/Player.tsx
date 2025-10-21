import { Player as PlayerData } from "../data/Player";

interface PlayerProps {
    data: PlayerData;
}

const Player: React.FC<PlayerProps> = ({ data }) => {
    return <div style={{
        border: `1px solid ${data.color}`,
        borderRadius: '15px',
        padding: '10px'
    }}>
        {data.name}: ${data.money}
    </div>;
};

export default Player;
