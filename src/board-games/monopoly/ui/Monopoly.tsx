import { useEffect } from "react";
import { MonopolyState } from "../data/MonopolyState";
import { Player } from "../data/Player";
import Square from "./Square";
import { MonopolyActions } from "../data/MonopolyActions";
import Board from "./Board";

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

    // const log = state.log.map((_, index) => {
    //     const entry = state.log[state.log.length - 1 - index];

    //     return <div key={index} style={{
    //         border: '1px solid grey',
    //         padding: '2px'
    //     }}>{entry}</div>;
    // });

    const squares = state.board.map((square, index) => <Square
        key={index}
        data={square}
        boardIndex={index}
    />);

    const center = <div style={{
        gridRow: '2 / span 9',
        gridColumn: '2 / span 9',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.25em'
    }}>
        This is the Monopoly board!
    </div>

    // const actionButton = (text: string) => <div style={{
    //     border: '1px solid white',
    //     padding: '10px',
    //     borderRadius: '15px'
    // }}>
    //     {text}
    // </div>;

    // const playerUi = state.players.map((player, index) => <div key={index} style={{
    //     border: `1px solid ${player.color}`,
    //     padding: '5px',
    //     borderRadius: '15px'
    // }}>
    //     {player.name}: ${player.money}
    // </div>);

    // return <div style={{
    //     display: 'flex',
    //     flexDirection: 'column',
    //     justifyContent: 'space-between',
    //     height: '100dvh',
    //     padding: '2px',
    //     boxSizing: 'border-box'
    // }}>
    //     {/* <div style={{
    //         height: '125px',
    //         overflow: 'auto'
    //     }}>{log}</div> */}

    //     <div style={{
    //         display: 'grid',
    //         gridTemplateColumns: `repeat(2, 1fr)`,
    //         gap: '5px',
    //         height: '125px',
    //         padding: '5px'
    //     }}>
    //         {playerUi}
    //     </div>

    //     <div style={{
    //         display: 'flex',
    //         justifyContent: 'center',
    //         alignItems: 'center'
    //     }}>
    //         <div style={{
    //             display: 'grid',
    //             gridTemplateColumns: 'repeat(11, 1fr)',
    //             gridTemplateRows: 'repeat(11, 1fr)',
    //             width: 'min(100dvw, calc(100dvh - 124px - 100px))'
    //         }}>
    //             {squares}
    //             {center}
    //         </div>
    //     </div>

    //     <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', height: '100px' }}>
    //         {actionButton('Action 1')}
    //         {actionButton('Action 2')}
    //         {actionButton('Action 3')}
    //         {actionButton('Action 4')}
    //     </div>
    // </div>;

    return <div style={{
        height: '100dvh',
        padding: '2px',
        boxSizing: 'border-box'
    }}>
        <Board>
            {squares}
            {center}
        </Board>
    </div>;
};

function playerTokensUi(index: number, players: Player[]): React.ReactNode {
    const player1 = players[0]?.position === index ? players[0]?.color : 'transparent';
    const player2 = players[1]?.position === index ? players[1]?.color : 'transparent';
    const player3 = players[2]?.position === index ? players[2]?.color : 'transparent';
    const player4 = players[3]?.position === index ? players[3]?.color : 'transparent';

    return <div style={{
        position: 'absolute',
        top: '0px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
    }}>
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            width: '75%',
            height: '75%'
        }}>
            <div style={{ borderRadius: '100%', backgroundColor: player1 }} />
            <div style={{ borderRadius: '100%', backgroundColor: player2 }} />
            <div style={{ borderRadius: '100%', backgroundColor: player3 }} />
            <div style={{ borderRadius: '100%', backgroundColor: player4 }} />
        </div>
    </div>;
}

export default Monopoly;
