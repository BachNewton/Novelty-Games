import { useState } from "react";

const MAX_USERNAME_LENGTH = 12;

interface LobbyProps {
    username: string;
    players: string[];
    setUsername: (username: string) => void;
    connect: (username: string) => void;
    startGame: (() => void);
}

const Lobby: React.FC<LobbyProps> = ({ username, players, setUsername, connect, startGame }) => {
    const [connectClicked, setConnectClicked] = useState(false);

    const startGameButton = players.length < 2
        ? null
        : <button style={{ fontSize: '1em' }} onClick={() => startGame()}>Start Game</button>;

    const playersUi = players.map((player, index) => <div key={index}>
        {player}
    </div>);

    const handleConnect = () => {
        if (connectClicked) return;
        if (username.trim() === '') return;

        setConnectClicked(true);
        connect(username);
    };

    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '15px',
        gap: '10px'
    }}>
        <div style={{ fontSize: '1.75em', fontWeight: 'bold' }}>Poker Lobby ♠ ♦ ♣ ♥</div>

        <input
            style={{ fontSize: '1em' }}
            type="text"
            placeholder="Username"
            maxLength={MAX_USERNAME_LENGTH}
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => {
                if (e.key === 'Enter') {
                    handleConnect();
                }
            }}
        />

        <button
            style={{ fontSize: '1em' }}
            onClick={handleConnect}
            disabled={connectClicked || username.trim() === ''}
        >Connect</button>

        {startGameButton}

        <div>Players:</div>
        {playersUi}
    </div>;
};

export default Lobby;
