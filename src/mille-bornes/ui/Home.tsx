import { useEffect, useState } from "react";
import { Communicator, GameEvent } from "../logic/Communicator";
import Lobby, { LobbyTeam } from "./Lobby";
import Board from "./Board";
import { Game } from "../logic/Data";
import { createGame } from "../logic/GameCreator";
import { imageToCard } from "../logic/Card";

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
            const game = (event as GameEvent).game;

            game.deck = game.deck.map(card => imageToCard(card.image));
            game.teams = game.teams.map(team => {
                team.players = team.players.map(player => {
                    player.hand = player.hand.map(card => imageToCard(card.image));

                    return player;
                });

                return team;
            });
            game.currentPlayer = game.teams[0].players[0];

            state.game = game;

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
