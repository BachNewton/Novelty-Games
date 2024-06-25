import { useEffect, useState } from "react";
import { Communicator, GameEvent } from "../logic/Communicator";
import { Game, Team } from "../logic/Data";
import { createGame } from "../logic/GameCreator";
import { Score, calculateScore } from "../logic/ScoreboardCalculator";
import Lobby, { LobbyTeam } from "./Lobby";
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
    scores: Map<Team, Score>;

    constructor(scores: Map<Team, Score>) {
        this.scores = scores;
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

    const onGameOver = (game: Game) => {
        setState(new ScoreboardState(calculateScore(game)));
    };

    if (state instanceof BoardState) {
        return <Board communicator={COMMUNICATOR} startingGame={state.game} localId={LOCAL_ID} onGameOver={onGameOver} />;
    } else if (state instanceof ScoreboardState) {
        return <Scoreboard scores={state.scores} />;
    } else {
        return <Lobby communicator={COMMUNICATOR} startGame={onStartGame} localId={LOCAL_ID} />;
    }
}

export default Home;
