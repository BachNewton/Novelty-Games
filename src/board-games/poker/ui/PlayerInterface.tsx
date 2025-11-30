import { useEffect, useRef, useState } from "react";
import VerticalSpacer from "../../../util/ui/Spacer";
import Action from "./Action";
import Card from "./Card";
import { Card as CardData } from "../data/Card";
import { GameData } from "../data/GameData";
import { coerceToRange } from "../../../util/Math";
import { createPokerOddsCalculator } from "../logic/PokerOddsCalculator";

const ACTION_LOCK_TIME = 4000;

interface PlayerInterfaceProps {
    data: GameData;
    actions: Actions;
    boardCards: CardData[];
}

export interface Actions {
    fold: () => void;
    check: () => void;
    call: () => void;
    raise: (amount: number) => void;
    allIn: () => void;
}

const PlayerInterface: React.FC<PlayerInterfaceProps> = ({ data, actions, boardCards }) => {
    const oddsCalculator = useRef(createPokerOddsCalculator()).current;
    const [minRaiseAmount, setMinRaiseAmount] = useState(data.toCall + 1);
    const maxRaiseAmount = data.player.stack;
    const [raiseAmount, setRaiseAmount] = useState(coerceToRange(0, minRaiseAmount, maxRaiseAmount));
    const [actionsLocked, setActionsLocked] = useState(false);
    const actionLockTimeout = useRef<NodeJS.Timeout | null>(null);

    const canRaise = minRaiseAmount < data.player.stack;

    const raiseText = canRaise
        ? data.toCall > 0
            ? `Raise $${raiseAmount}`
            : `Bet $${raiseAmount}`
        : 'Bet / Raise';

    const clearActionLock = () => {
        if (actionLockTimeout.current) clearTimeout(actionLockTimeout.current);
    };

    oddsCalculator.calculate(data.player.card1, data.player.card2, boardCards, data.players);

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
            border: '1px solid black',
            borderRadius: '5px',
            padding: '5px',
            boxShadow: '0px 0px 5px black',
            textAlign: 'center',
            fontSize: '1.1em'
        }}>
            {data.player.handEvaluation}
        </div>

        <VerticalSpacer height={10} />

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
                    textAlign: 'center',
                    fontSize: '1.2em'
                }}>
                    Stack ${data.player.stack}
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
