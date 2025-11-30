import { useEffect, useRef, useState } from "react";
import VerticalSpacer from "../../../util/ui/Spacer";
import Action from "./Action";
import Card from "./Card";
import { GameData } from "../data/GameData";
import { coerceToRange } from "../../../util/Math";

const ACTION_LOCK_TIME = 4000;

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
    const [actionsLocked, setActionsLocked] = useState(false);
    const actionLockTimeout = useRef<NodeJS.Timeout | null>(null);
    const canRaise = minRaiseAmount < data.player.stack;
    const raiseText = canRaise ? `Raise $${raiseAmount}` : 'Raise';

    const clearActionLock = () => {
        if (actionLockTimeout.current) clearTimeout(actionLockTimeout.current);
    };

    useEffect(() => {
        const updatedMinRaiseAmount = data.toCall + 1;
        const amount = coerceToRange(0, updatedMinRaiseAmount, maxRaiseAmount);
        setMinRaiseAmount(updatedMinRaiseAmount);
        setRaiseAmount(amount);

        if (data.player.isTurn) {
            setActionsLocked(false);
            clearActionLock();
        }

        return () => {
            clearActionLock();
        };
    }, [data]);

    const isTurn = data.player.isTurn;

    const handleAction = (action: () => void) => {
        clearActionLock();
        setActionsLocked(true);
        action();
        actionLockTimeout.current = setTimeout(() => setActionsLocked(false), ACTION_LOCK_TIME);
    };

    const checkCallUi = data.toCall === 0
        ? <Action isEnabled={isTurn && !actionsLocked} onClick={() => handleAction(actions.check)}>Check</Action>
        : <Action isEnabled={isTurn && !actionsLocked} onClick={() => handleAction(actions.call)}>{`Call $${data.toCall}`}</Action>;

    return <div>
        <div style={{
            display: 'grid',
            gap: '10px',
            gridTemplateColumns: 'repeat(3, 1fr)'
        }}>
            <Action isEnabled={isTurn && !actionsLocked} onClick={() => handleAction(actions.fold)}>Fold</Action>

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

        <Action isEnabled={isTurn && canRaise && !actionsLocked} onClick={() => {
            const amount = raiseAmount + data.player.inPot;
            handleAction(() => actions.raise(amount));
        }}>{raiseText}</Action>

        <VerticalSpacer height={10} />

        <input
            type="range"
            value={raiseAmount}
            disabled={!data.player.isTurn || !canRaise || actionsLocked}
            min={minRaiseAmount}
            max={maxRaiseAmount}
            onChange={e => setRaiseAmount(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'white' }}
        />
    </div>;
};

export default PlayerInterface;
