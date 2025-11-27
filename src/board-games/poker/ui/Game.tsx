import { Card as CardData } from "../data/Card";
import { GameData } from "../data/GameData";
import Board from "./Board";
import Card from "./Card";

interface GameProps {
    data: GameData;
    isYourTurn: boolean;
    actions: Actions;
    pot: number;
    boardCards: CardData[];
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

    const boardCardsUi = boardCards.map((card, index) => <Card key={index} data={card} />);

    return <div style={{
        margin: '10px'
    }}>
        <Board pot={pot} cards={boardCards} />

        <div>Pot size: {pot}</div>
        <div>Player: {data.player.name}</div>
        <div>Your cards:</div>
        <div style={{
            display: 'flex',
            gap: '10px'
        }}>
            <Card data={data.player.card1} />
            <Card data={data.player.card2} />
        </div>
        {isTurn ? <div>It's your turn!</div> : <div>Waiting for other players...</div>}
        <div>Stack: {data.player.stack}</div>
        <button disabled={!isTurn} onClick={actions.fold}>Fold</button>
        <button disabled={!isTurn} onClick={actions.check}>Check</button>
        <button disabled={!isTurn} onClick={actions.call}>Call</button>
        <button disabled={!isTurn} onClick={() => actions.raise(10)}>Raise</button>
        <button disabled={!isTurn} onClick={actions.allIn}>All In</button>
    </div>;
};

export default Game;
