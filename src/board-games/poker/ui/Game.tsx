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
    messages: string[];
}

interface Actions {
    fold: () => void;
    check: () => void;
    call: () => void;
    raise: (amount: number) => void;
    allIn: () => void;
}

const Game: React.FC<GameProps> = ({ data, isYourTurn, actions, pot, boardCards, messages }) => {
    const [raiseAmount, setRaiseAmount] = useState(0);

    const isTurn = data.player.isTurn;

    const messgaesUi = messages.map((message, index) => <div key={index} style={{ marginBottom: '5px' }}>{message}</div>);

    return <div style={{
        userSelect: 'none',
        padding: '10px',
        height: '100dvh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
    }}>
        <Board pot={pot} cards={boardCards} data={data} />

        <VerticalSpacer height={10} />

        <div style={{
            flexGrow: 1,
            overflow: 'auto',
            border: '1px solid black',
            borderRadius: '5px',
            padding: '5px',
            boxShadow: '0px 0px 5px black'
        }}>
            {messgaesUi}
        </div>

        <VerticalSpacer height={10} />

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
                    gap: '10px',
                    justifyContent: 'center'
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
                    Stack: ${data.player.stack}
                </div>
            </div>

            <Action isEnabled={isTurn} onClick={actions.check}>Check / Call</Action>
        </div>

        <VerticalSpacer height={10} />

        <Action isEnabled={isTurn} onClick={() => {
            actions.raise(raiseAmount);
            setRaiseAmount(0);
        }}>{`Raise $${raiseAmount}`}</Action>

        <VerticalSpacer height={10} />

        <input
            type="range"
            value={raiseAmount}
            disabled={!data.player.isTurn}
            min={0}
            max={data.player.stack + data.player.inPot}
            onChange={e => setRaiseAmount(Number(e.target.value))}
        />
    </div>;
};

export default Game;
