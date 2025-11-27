interface LobbyProps {
    username: string;
    setUsername: (username: string) => void;
    connect: (username: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ username, setUsername, connect }) => {
    return <div>
        <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
        />
        <br />
        <button onClick={() => connect(username)}>Connect</button>
    </div>;
};

export default Lobby;
