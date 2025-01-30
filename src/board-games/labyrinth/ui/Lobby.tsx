import { useState } from "react";
import Dialog from "../../../util/ui/Dialog";
import TextInput, { InputHolder } from "../../../util/ui/TextInput";
import { PlayerColor } from "../data/Piece";
import { getColor } from "./Circle";

interface Player {
    name: string;
    color: PlayerColor;
}

const Lobby: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [isPlayerPromptOpen, setIsPlayerPromptOpen] = useState(false);

    const playersUi = players.map((player, index) => {
        return <div key={index} style={{ border: `2px solid ${getColor(player.color)}`, borderRadius: '15px', margin: '5px', padding: '7.5px' }}>
            {player.name}
        </div>;
    });

    return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '1.5em', flexDirection: 'column' }}>
        <div style={{ fontSize: '1.5em', marginBottom: '25px', fontWeight: 'bold' }}>🧭 Labyrinth 🧩</div>

        <button style={{ fontSize: '1em', marginBottom: '25px' }} disabled={players.length >= 4} onClick={() => setIsPlayerPromptOpen(true)}>Add Player</button>

        <div style={{ display: 'flex', flexDirection: 'column' }}>{playersUi}</div>

        <button style={{ fontSize: '1em', marginTop: '25px' }} disabled={players.length < 1}>Start Game</button>

        <Dialog isOpen={isPlayerPromptOpen} content={<PlayerPrompt onSubmit={name => {
            setIsPlayerPromptOpen(false);

            const player: Player = {
                name: name,
                color: players.length as PlayerColor
            };

            setPlayers(players.concat(player));
        }} />} />
    </div>;
};

interface PlayerPromptProps {
    onSubmit: (name: string) => void;
}

const PlayerPrompt: React.FC<PlayerPromptProps> = ({ onSubmit }) => {
    const [holder] = useState<InputHolder>({ input: '' });

    return <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
        <TextInput placeholder={'Player Name'} holder={holder} onEnter={() => onSubmit(holder.input)} />
        <button style={{ fontSize: '1em', marginTop: '25px' }} onClick={() => onSubmit(holder.input)}>Submit</button>
    </div>;
};

export default Lobby;
