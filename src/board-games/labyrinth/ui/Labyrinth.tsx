import { useEffect, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import Game from "./Game";
import Lobby from "./Lobby";

interface State { }

class LobbyState implements State { }
class GameState implements State { }

const Labyrinth: React.FC = () => {
    const [state, setState] = useState<State>(new GameState());

    useEffect(() => updateRoute(Route.LABYRINTH), []);

    if (state instanceof GameState) {
        return <Game />;
    } else {
        return <Lobby />;
    }
}

export default Labyrinth;
