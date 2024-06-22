import { useEffect, useState } from "react";
import { Communicator } from "../logic/Communicator";
import Lobby, { LobbyTeam } from "./Lobby";
import Board from "./Board";
import { Game } from "../logic/Data";

interface State {
    ui: UiState;
    communicator: Communicator;
    game?: Game;
}

enum UiState {
    LOBBY,
    BOARD
}

const Home: React.FC = () => {
    const [state, setState] = useState<State>({ ui: UiState.LOBBY, communicator: new Communicator() });

    const onStartGame = (lobbyTeams: Array<LobbyTeam>) => {
        console.log(lobbyTeams);
    };

    switch (state.ui) {
        case UiState.LOBBY:
            return <Lobby communicator={state.communicator} startGame={onStartGame} />;
        case UiState.BOARD:
            return <Board communicator={state.communicator} game={state.game as Game} />;
    }
}

export default Home;
