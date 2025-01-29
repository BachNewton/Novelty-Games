import { useState } from "react";
import Dialog from "../../../util/ui/Dialog";
import TextInput, { InputHolder } from "../../../util/ui/TextInput";
import { PlayerColor } from "../data/Piece";

interface Player {
    name: string;
    color: PlayerColor;
}

const Lobby: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [isPlayerPromptOpen, setIsPlayerPromptOpen] = useState(false);

    return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '1.5em', flexDirection: 'column' }}>
        <div style={{ fontSize: '1.5em', marginBottom: '25px', fontWeight: 'bold' }}>🧭 Labyrinth 🧩</div>

        <button style={{ fontSize: '1em' }} onClick={() => setIsPlayerPromptOpen(true)}>Add Player</button>

        <Dialog isOpen={isPlayerPromptOpen} content={<PlayerPrompt onSubmit={name => {
            setIsPlayerPromptOpen(false);

            const player: Player = {
                name: name,
                color: players.length === 0 ? PlayerColor.RED : PlayerColor.BLUE
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
