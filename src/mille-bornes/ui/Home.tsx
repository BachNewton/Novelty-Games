import { useEffect, useState } from "react";
import { Communicator, GameEvent } from "../logic/Communicator";
import Lobby, { LobbyTeam } from "./Lobby";
import Board from "./Board";
import { Game } from "../logic/Data";
import { createGame } from "../logic/GameCreator";

interface State {
    ui: UiState;
    game?: Game;
}

enum UiState {
    LOBBY,
    BOARD
}

const LOCAL_ID = Math.random().toString();
const COMMUNICATOR = new Communicator();

const Home: React.FC = () => {
    const [state, setState] = useState<State>({ ui: UiState.LOBBY });

    useEffect(() => {
        COMMUNICATOR.addEventListener(GameEvent.TYPE, (event) => {
            state.game = (event as GameEvent).game;
            state.ui = UiState.BOARD;
            setState({ ...state });
        });
    }, [COMMUNICATOR]);

    const onStartGame = (lobbyTeams: Array<LobbyTeam>) => {
        const game = createGame(lobbyTeams);
        state.ui = UiState.BOARD;
        state.game = game
        setState({ ...state });
        COMMUNICATOR.startGame(game);
    };

    switch (state.ui) {
        case UiState.LOBBY:
            return <Lobby communicator={COMMUNICATOR} startGame={onStartGame} localId={LOCAL_ID} />;
        case UiState.BOARD:
            return <Board communicator={COMMUNICATOR} game={state.game as Game} localId={LOCAL_ID} />;
    }
}

export default Home;
