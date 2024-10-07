import { useEffect, useState } from "react";
import { Communicator } from "../logic/Communicator";
import { Game, Team } from "../logic/Data";
import { createGame } from "../logic/GameCreator";
import { Score } from "../logic/ScoreboardCalculator";
import Lobby, { LobbyPlayer, LobbyTeam } from "./Lobby";
import Board from "./Board";
import Scoreboard from "./Scoreboard";
import { GameEvent } from "../logic/NewtorkCommunicator";

interface HomeProps {
    onHomeButtonClicked: () => void;
    communicator: Communicator;
}

interface State { }

class LobbyState implements State { }

class BoardState implements State {
    game: Game;

    constructor(game: Game) {
        this.game = game;
    }
}

class ScoreboardState implements State {
    game: Game;

    constructor(game: Game) {
        this.game = game;
    }
}

const LOCAL_ID = Math.random().toString();

const Home: React.FC<HomeProps> = ({ onHomeButtonClicked, communicator }) => {
    const [state, setState] = useState<State>(new LobbyState());

    useEffect(() => {
        communicator.addEventListener(GameEvent.TYPE, (event) => {
            setState(new BoardState((event as GameEvent).game));
        });
    }, [state]);

    const onStartGame = (lobbyTeams: Array<LobbyTeam>) => {
        const game = createGame(lobbyTeams);
        setState(new BoardState(game));
        communicator.startGame(game);
    };

    const onRoundOver = (game: Game) => {
        setState(new ScoreboardState(game));
    };

    const onBackToLobby = () => {
        setState(new LobbyState());
    };

    const onPlayNextRound = (game: Game, scores: Map<Team, Score>) => {
        const lobbyTeams = game.teams.map<LobbyTeam>(team => {
            return {
                accumulatedScore: scores.get(team)?.gameTotal || 0,
                players: team.players.map<LobbyPlayer>(player => {
                    return {
                        name: player.name,
                        localId: player.localId,
                        type: player.type
                    };
                })
            };
        });

        const newGame = createGame(lobbyTeams);
        setState(new BoardState(newGame));
        communicator.startGame(newGame);
    };

    if (state instanceof BoardState) {
        return <Board communicator={communicator} startingGame={state.game} localId={LOCAL_ID} onRoundOver={onRoundOver} />;
    } else if (state instanceof ScoreboardState) {
        return <Scoreboard game={state.game} onBackToLobby={onBackToLobby} onPlayNextRound={onPlayNextRound} />;
    } else {
        return <Lobby onHomeButtonClicked={onHomeButtonClicked} communicator={communicator} startGame={onStartGame} localId={LOCAL_ID} />;
    }
}

export default Home;
