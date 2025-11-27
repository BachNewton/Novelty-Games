import { useEffect, useRef, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import { createPokerNetworking } from "../logic/PokerNetworking";
import Lobby from "./Lobby";

interface HomeProps { }

type State = LobbyState | GameState;

interface LobbyState {
    type: 'lobby';
}

interface GameState {
    type: 'game';
}

const DEFAULT_STATE: LobbyState = { type: 'lobby' };

const Home: React.FC<HomeProps> = ({ }) => {
    const networking = useRef(createPokerNetworking()).current;
    const [state, setState] = useState<State>(DEFAULT_STATE);
    const [username, setUsername] = useState('');
    const [players, setPlayers] = useState<string[]>([]);

    useEffect(() => {
        updateRoute(Route.POKER);

        networking.onGameBegun(() => {
            const gameState: GameState = { type: 'game' };
            setState(gameState);
        });

        networking.onRoomUsers(users => {
            setPlayers(users);
        });
    }, []);

    switch (state.type) {
        case 'lobby':
            return <Lobby
                username={username}
                players={players}
                setUsername={setUsername}
                connect={networking.connect}
                startGame={networking.startGame}
            />;
        case 'game':
            return <div>Game has started! Good luck, {username}!</div>;
    }

    // return <div>
    //     <input
    //         type="text"
    //         placeholder="Username"
    //         value={username}
    //         onChange={e => setUsername(e.target.value)}
    //     />
    //     <br />
    //     <button onClick={() => networking.connect(username)}>Connect</button>
    //     <br />
    //     <button onClick={() => networking.startGame()}>Start Game</button>
    // </div>;
};

export default Home;
