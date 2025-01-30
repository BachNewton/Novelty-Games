import { useEffect, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import Game from "./Game";
import Lobby, { Player } from "./Lobby";

interface State { }

class LobbyState implements State { }

class GameState implements State {
    players: Player[];

    constructor(players: Player[]) {
        this.players = players;
    }
}

const Labyrinth: React.FC = () => {
    const [state, setState] = useState<State>(new LobbyState());

    useEffect(() => updateRoute(Route.LABYRINTH), []);

    if (state instanceof GameState) {
        return <Game />;
    } else {
        return <Lobby onStart={players => setState(new GameState(players))} />;
    }
}

export default Labyrinth;
