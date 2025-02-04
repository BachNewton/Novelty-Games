import { useEffect, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import Game from "./Game";
import Lobby from "./Lobby";
import { createPlayer, Player, PlayerColor } from "../data/Player";

interface State { }

class LobbyState implements State { }

class GameState implements State {
    players: Player[];

    constructor(players: Player[]) {
        this.players = players;
    }
}

const Labyrinth: React.FC = () => {
    const [state, setState] = useState<State>(new GameState([
        createPlayer('Test 1', PlayerColor.RED),
        createPlayer('Test 2', PlayerColor.BLUE),
        createPlayer('Test 3', PlayerColor.YELLOW),
        createPlayer('Test 4', PlayerColor.GREEN)
    ]));

    useEffect(() => updateRoute(Route.LABYRINTH), []);

    if (state instanceof GameState) {
        return <Game players={state.players} />;
    } else {
        return <Lobby onStart={players => setState(new GameState(players))} />;
    }
}

export default Labyrinth;
