import { useState } from "react";
import { Card as CardData } from "../data/Card";
import { GameData } from "../data/GameData";
import Action from "./Action";
import Board from "./Board";
import Card from "./Card";

interface GameProps {
    data: GameData;
    isYourTurn: boolean;
    actions: Actions;
    pot: number;
    boardCards: CardData[];
    message: string;
}

interface Actions {
    fold: () => void;
    check: () => void;
    call: () => void;
    raise: (amount: number) => void;
    allIn: () => void;
}

const Game: React.FC<GameProps> = ({ data, isYourTurn, actions, pot, boardCards, message }) => {
    const [raiseAmount, setRaiseAmount] = useState(0);

    const isTurn = data.player.isTurn;

    return <div style={{
        padding: '10px',
        height: '100dvh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
    }}>
        <Board pot={pot} cards={boardCards} data={data} message={message} />

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
        <div>Stack: {data.player.stack}</div>
        <div style={{ flexGrow: 1 }}></div>

        <div style={{
            display: 'grid',
            gap: '10px'
            // gridTemplateColumns: '1fr 1fr'
        }}>
            <Action isEnabled={isTurn} onClick={actions.fold}>Fold</Action>
            <Action isEnabled={isTurn} onClick={actions.check}>Check</Action>
            <Action isEnabled={isTurn} onClick={actions.call}>Call</Action>
            <Action isEnabled={isTurn} onClick={() => actions.raise(raiseAmount)}>{`Raise ${raiseAmount}`}</Action>
            <input
                type="range"
                value={raiseAmount}
                min={0}
                max={data.player.stack}
                onChange={e => setRaiseAmount(Number(e.target.value))}
            />

            {/* <button disabled={!isTurn} onClick={actions.fold}>Fold</button> */}
            {/* <button disabled={!isTurn} onClick={actions.check}>Check</button> */}
            {/* <button disabled={!isTurn} onClick={actions.call}>Call</button> */}
            {/* <button disabled={!isTurn} onClick={() => actions.raise(10)}>Raise</button> */}
            {/* <button disabled={!isTurn} onClick={actions.allIn}>All In</button> */}
        </div>
    </div>;
};

export default Game;
