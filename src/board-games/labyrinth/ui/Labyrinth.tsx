import { useEffect, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import Game from "./Game";
import Lobby from "./Lobby";
import { Player, PlayerColor } from "../data/Player";

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
        { name: 'Test 1', position: { x: -1, y: -1 }, color: PlayerColor.RED },
        { name: 'Test 2', position: { x: -1, y: -1 }, color: PlayerColor.BLUE },
        { name: 'Test 3', position: { x: -1, y: -1 }, color: PlayerColor.YELLOW },
        { name: 'Test 4', position: { x: -1, y: -1 }, color: PlayerColor.GREEN }
    ]));

    useEffect(() => updateRoute(Route.LABYRINTH), []);

    if (state instanceof GameState) {
        return <Game players={state.players} />;
    } else {
        return <Lobby onStart={players => setState(new GameState(players))} />;
    }
}

export default Labyrinth;
