import { GameData } from "../data/GameData";

interface GameProps {
    data: GameData;
    isYourTurn: boolean;
    actions: Actions;
}

interface Actions {
    fold: () => void;
    check: () => void;
    call: () => void;
    raise: (amount: number) => void;
    allIn: () => void;
}

const Game: React.FC<GameProps> = ({ data, isYourTurn, actions }) => {
    return <div>
        <div>Your cards: {data.player.card1}, {data.player.card2}</div>
        {isYourTurn ? <div>It's your turn!</div> : <div>Waiting for other players...</div>}
        <button onClick={actions.fold}>Fold</button>
        <button onClick={actions.check}>Check</button>
        <button onClick={actions.call}>Call</button>
        <button onClick={() => actions.raise(10)}>Raise</button>
        <button onClick={actions.allIn}>All In</button>
    </div>;
};

export default Game;
