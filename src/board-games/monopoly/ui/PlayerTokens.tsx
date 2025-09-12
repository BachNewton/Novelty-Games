import { Player } from "../data/Player";

interface PlayerTokensProps {
    players: Player[];
}

const PlayerTokens: React.FC<PlayerTokensProps> = ({ players }) => {
    const tokens = players.map((player, index) => <div key={index} style={{
        borderRadius: '100%',
        backgroundColor: player.color
    }} />);

    const cols = players.length > 1 ? 2 : 1;

    return <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        height: '75%',
        width: '75%'
    }}>
        {tokens}
    </div>;
};

export default PlayerTokens;
