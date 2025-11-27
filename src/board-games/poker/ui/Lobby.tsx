interface LobbyProps {
    username: string;
    players: string[];
    setUsername: (username: string) => void;
    connect: (username: string) => void;
    startGame: (() => void);
}

const Lobby: React.FC<LobbyProps> = ({ username, players, setUsername, connect, startGame }) => {
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
        <button onClick={() => connect(username)}>Connect</button>
        <br />
        {startGameButton}
        <br />
        <div>Players:</div>
        {playersUi}
    </div>;
};

export default Lobby;
