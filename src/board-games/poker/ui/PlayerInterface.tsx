import { useEffect, useState } from "react";
import VerticalSpacer from "../../../util/ui/Spacer";
import Action from "./Action";
import Card from "./Card";
import { GameData } from "../data/GameData";
import { coerceToRange } from "../../../util/Math";

interface PlayerInterfaceProps {
    data: GameData;
    actions: Actions;
}

export interface Actions {
    fold: () => void;
    check: () => void;
    call: () => void;
    raise: (amount: number) => void;
    allIn: () => void;
}

const PlayerInterface: React.FC<PlayerInterfaceProps> = ({ data, actions }) => {
    const [minRaiseAmount, setMinRaiseAmount] = useState(data.toCall + 1);
    const maxRaiseAmount = data.player.stack;
    const [raiseAmount, setRaiseAmount] = useState(coerceToRange(0, minRaiseAmount, maxRaiseAmount));
    const canRaise = minRaiseAmount < data.player.stack;
    const raiseText = canRaise ? `Raise $${raiseAmount}` : 'Raise';

    useEffect(() => {
        const updatedMinRaiseAmount = data.toCall + 1;
        const amount = coerceToRange(raiseAmount, updatedMinRaiseAmount, maxRaiseAmount);
        setMinRaiseAmount(updatedMinRaiseAmount);
        setRaiseAmount(amount);
    }, [data]);

    const isTurn = data.player.isTurn;

    const checkCallUi = data.toCall === 0
        ? <Action isEnabled={isTurn} onClick={actions.check}>Check</Action>
        : <Action isEnabled={isTurn} onClick={actions.call}>{`Call $${data.toCall}`}</Action>;

    return <div>
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

            {checkCallUi}
        </div>

        <VerticalSpacer height={10} />

        <Action isEnabled={isTurn && canRaise} onClick={() => {
            const amount = raiseAmount + data.player.inPot;
            actions.raise(amount);
        }}>{raiseText}</Action>

        <VerticalSpacer height={10} />

        <input
            type="range"
            value={raiseAmount}
            disabled={!data.player.isTurn || !canRaise}
            min={minRaiseAmount}
            max={maxRaiseAmount}
            onChange={e => setRaiseAmount(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'white' }}
        />
    </div>;
};

export default PlayerInterface;
