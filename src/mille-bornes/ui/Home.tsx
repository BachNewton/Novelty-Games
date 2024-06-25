import { useEffect, useState } from "react";
import { Communicator, GameEvent } from "../logic/Communicator";
import { Game, Team } from "../logic/Data";
import { createGame } from "../logic/GameCreator";
import { Score } from "../logic/ScoreboardCalculator";
import Lobby, { LobbyPlayer, LobbyTeam } from "./Lobby";
import Board from "./Board";
import Scoreboard from "./Scoreboard";

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
const COMMUNICATOR = new Communicator();

const Home: React.FC = () => {
    const [state, setState] = useState<State>(new LobbyState());

    useEffect(() => {
        COMMUNICATOR.addEventListener(GameEvent.TYPE, (event) => {
            setState(new BoardState((event as GameEvent).game));
        });
    }, [state]);

    const onStartGame = (lobbyTeams: Array<LobbyTeam>) => {
        const game = createGame(lobbyTeams);
        setState(new BoardState(game));
        COMMUNICATOR.startGame(game);
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
                accumulatedScore: scores.get(team)?.total || 0,
                players: team.players.map<LobbyPlayer>(player => {
                    return {
                        name: player.name,
                        localId: player.localId
                    };
                })
            };
        });

        const newGame = createGame(lobbyTeams);
        setState(new BoardState(newGame));
        COMMUNICATOR.startGame(newGame);
    };

    if (state instanceof BoardState) {
        return <Board communicator={COMMUNICATOR} startingGame={state.game} localId={LOCAL_ID} onRoundOver={onRoundOver} />;
    } else if (state instanceof ScoreboardState) {
        return <Scoreboard game={state.game} onBackToLobby={onBackToLobby} onPlayNextRound={onPlayNextRound} />;
    } else {
        return <Lobby communicator={COMMUNICATOR} startGame={onStartGame} localId={LOCAL_ID} />;
    }
}

export default Home;
