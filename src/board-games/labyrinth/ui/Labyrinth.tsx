import { useEffect, useState } from "react";
import { Route, updateRoute } from "../../../ui/Routing";
import Game from "./Game";
import Lobby from "./Lobby";
import { LabyrinthCommunicator } from "../logic/LabyrinthCommunicator";
import { Lobby as LobbyData } from "../data/Lobby";
import { Game as GameData } from "../data/Game";
import { createStartingGame } from "../logic/GameSetup";

interface LabyrinthProps {
    communicator: LabyrinthCommunicator;
}

interface State { }

class LobbyState implements State { }

class GameState implements State {
    game: GameData;

    constructor(game: GameData) {
        this.game = game;
    }
}

const Labyrinth: React.FC<LabyrinthProps> = ({ communicator }) => {
    const [state, setState] = useState<State>(new LobbyState());

    useEffect(() => updateRoute(Route.LABYRINTH), []);

    const onStartGame = (lobby: LobbyData) => {
        const game = createStartingGame(lobby);

        communicator.createGame(game).then(() => communicator.deleteLobby());

        setState(new GameState(game));
    };

    if (state instanceof GameState) {
        return <Game game={state.game} />;
    } else {
        return <Lobby communicator={communicator} onStartGame={onStartGame} />;
    }
}

export default Labyrinth;
