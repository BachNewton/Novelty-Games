import { GameData } from "../data/GameData";

interface GameProps {
    data: GameData;
    isYourTurn: boolean;
    actions: Actions;
    pot: number;
    boardCards: string[];
}

interface Actions {
    fold: () => void;
    check: () => void;
    call: () => void;
    raise: (amount: number) => void;
    allIn: () => void;
}

const Game: React.FC<GameProps> = ({ data, isYourTurn, actions, pot, boardCards }) => {
    const isTurn = data.player.isTurn;

    return <div>
        <div>Board cards: {boardCards.join(', ')}</div>
        <div>Pot size: {pot}</div>
        <div>Your cards: {data.player.card1}, {data.player.card2}</div>
        {isTurn ? <div>It's your turn!</div> : <div>Waiting for other players...</div>}
        <button disabled={!isTurn} onClick={actions.fold}>Fold</button>
        <button disabled={!isTurn} onClick={actions.check}>Check</button>
        <button disabled={!isTurn} onClick={actions.call}>Call</button>
        <button disabled={!isTurn} onClick={() => actions.raise(10)}>Raise</button>
        <button disabled={!isTurn} onClick={actions.allIn}>All In</button>
    </div>;
};

export default Game;
