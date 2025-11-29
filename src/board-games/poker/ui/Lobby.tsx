import { useState } from "react";

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
        : <button onClick={() => startGame()}>Start Game</button>;

    const playersUi = players.map((player, index) => <div key={index}>
        {player}
    </div>);

    return <div>
        <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
        />
        <br />
        <button onClick={() => {
            setConnectClicked(true);
            connect(username);
        }} disabled={connectClicked}>Connect</button>
        <br />
        {startGameButton}
        <br />
        <div>Players:</div>
        {playersUi}
    </div>;
};

export default Lobby;
