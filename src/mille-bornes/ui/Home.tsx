import { useEffect, useState } from "react";
import { Communicator } from "../logic/Communicator";
import Lobby from "./Lobby";
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

    const onReady = (game: Game) => {
        state.ui = UiState.BOARD;
        state.game = game;
        setState({ ...state });
    };

    useEffect(() => {
        // state.communicator.addEventListener()
    }, [])

    switch (state.ui) {
        case UiState.LOBBY:
            return <Lobby communicator={state.communicator} onReady={onReady} />;
        case UiState.BOARD:
            return <Board communicator={state.communicator} game={state.game as Game} />;
    }
}

export default Home;
