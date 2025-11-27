import { useEffect, useRef, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import { createPokerNetworking } from "../logic/PokerNetworking";

interface HomeProps { }

const Home: React.FC<HomeProps> = ({ }) => {
    const networking = useRef(createPokerNetworking()).current;
    const [username, setUsername] = useState('');

    useEffect(() => {
        updateRoute(Route.POKER);
    }, []);

    return <div>
        <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
        />
        <br />
        <button onClick={() => networking.connect(username)}>Connect</button>
        <br />
        <button onClick={() => networking.startGame()}>Start Game</button>
    </div>;
};

export default Home;
