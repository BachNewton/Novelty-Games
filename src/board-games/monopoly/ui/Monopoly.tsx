import React, { useEffect } from "react";
import { MonopolyState } from "../data/MonopolyState";
import Square from "./Square";
import { MonopolyActions } from "../data/MonopolyActions";
import Board from "./Board";
import PlayerTokens from "./PlayerTokens";
import CenterBoard from "./CenterBoard";
import Button from "./Button";

const ACTION_DELAY_MS = 1500;

interface MonopolyProps {
    state: MonopolyState;
    actions: MonopolyActions;
    id: string;
}

const Monopoly: React.FC<MonopolyProps> = ({ state, actions, id }) => {
    useEffect(() => {
        const currentPlayer = state.players[state.currentPlayerIndex];
        let timeoutId: NodeJS.Timeout | undefined;

        if (id === currentPlayer.id && state.phase.type === 'ready') {
            timeoutId = setTimeout(() => {
                actions.roll();
            }, ACTION_DELAY_MS);
        }

        return () => clearTimeout(timeoutId);
    }, [state]);

    const squares = state.board.map((square, index) => <Square
        key={index}
        data={square}
        boardIndex={index}
        playerColors={state.players.map(player => player.color)}
    >
        <PlayerTokens players={state.players.filter(player => player.position === index)} />
    </Square>);

    const center = <div></div>;

    // const playerUi = state.players.map((player, index) => <div key={index} style={{
    //     border: `1px solid ${player.color}`,
    //     padding: '5px',
    //     borderRadius: '15px'
    // }}>
    //     {player.name}: ${player.money}
    // </div>);

    return <div style={{
        height: '100dvh',
        padding: '2px',
        boxSizing: 'border-box'
    }}>
        <Board>
            {squares}

            <CenterBoard>
                {centerUi(state, actions)}
            </CenterBoard>
        </Board>
    </div>;
};

function centerUi(state: MonopolyState, actions: MonopolyActions): React.ReactNode {
    switch (state.phase.type) {
        case 'buy-property':
            return <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                height: '100%',
                fontSize: '1.25em',
                position: 'relative'
            }}>
                <div>Property for Sale</div>
                <div>{state.phase.property.name}</div>
                <div>${state.phase.property.price}</div>
                <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    width: '75%',
                    gap: '15px'
                }}>
                    <Button text='Auction' />
                    <Button text='Buy' onClick={actions.buyProperty} />
                </div>
            </div>;
    }
}

export default Monopoly;
