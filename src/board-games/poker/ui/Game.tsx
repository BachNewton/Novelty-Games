import { useState } from "react";
import { Card as CardData } from "../data/Card";
import { GameData } from "../data/GameData";
import Action from "./Action";
import Board from "./Board";
import Card from "./Card";
import VerticalSpacer from "../../../util/ui/Spacer";

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

        <div>Player: {data.player.name}</div>

        <div style={{ flexGrow: 1 }}></div>

        <div style={{
            display: 'grid',
            gap: '10px',
            gridTemplateColumns: 'repeat(3, 1fr)'
        }}>
            <Action isEnabled={isTurn} onClick={actions.fold}>Fold</Action>

            <div style={{
                display: 'flex',
                gap: '5px',
                flexDirection: 'column'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '10px'
                }}>
                    <Card data={data.player.card1} />
                    <Card data={data.player.card2} />
                </div>
                <div style={{
                    flexGrow: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    Stack: {data.player.stack}
                </div>
            </div>

            <div style={{
                display: 'flex',
                gap: '5px',
                flexDirection: 'column'
            }}>
                <Action isEnabled={isTurn} onClick={actions.check}>Check</Action>
                <Action isEnabled={isTurn} onClick={actions.call}>Call</Action>
            </div>
        </div>

        <VerticalSpacer height={10} />

        <Action isEnabled={isTurn} onClick={() => actions.raise(raiseAmount)}>{`Raise ${raiseAmount}`}</Action>

        <VerticalSpacer height={10} />

        <input
            type="range"
            value={raiseAmount}
            min={0}
            max={data.player.stack}
            onChange={e => setRaiseAmount(Number(e.target.value))}
        />
    </div>;
};

export default Game;
