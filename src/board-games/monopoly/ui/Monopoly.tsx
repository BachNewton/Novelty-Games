import { useEffect } from "react";
import { MonopolyState } from "../data/MonopolyState";
import { Player } from "../data/Player";
import Square from "./Square";
import { MonopolyActions } from "../data/MonopolyActions";

const MAX_BOARD_WIDTH = 900;
const ACTION_DELAY_MS = 500;

interface MonopolyProps {
    state: MonopolyState;
    actions: MonopolyActions;
    id: string;
}

const Monopoly: React.FC<MonopolyProps> = ({ state, actions, id }) => {
    useEffect(() => {
        const currentPlayer = state.players[state.currentPlayerIndex];

        if (id === currentPlayer.id) {
            setTimeout(() => {
                actions.roll();
            }, ACTION_DELAY_MS);
        }
    }, [state]);

    const squares = state.board.map((square, index) => (
        <div key={index} style={{
            ...getGridPosition(index),
            border: '1px solid white',
            boxSizing: 'border-box',
            aspectRatio: 1,
            position: 'relative'
        }}>
            <Square data={square} />

            {playersUi(index, state.players)}
        </div>
    ));

    const center = <div style={{
        gridRow: '2 / span 9',
        gridColumn: '2 / span 9',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.5em'
    }}>
        This is the Monopoly board!
    </div>

    return <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(11, 1fr)',
        gridTemplateRows: 'repeat(11, 1fr)',
        margin: '2px',
        maxWidth: `${MAX_BOARD_WIDTH}px`
    }}>
        {squares}
        {center}
    </div>;
};

function playersUi(index: number, players: Player[]): React.ReactNode {
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

function getGridPosition(index: number): React.CSSProperties {
    // Bottom Row (squares 0-10)
    if (index <= 10) {
        return { gridRow: 11, gridColumn: 11 - index };
    }

    // Left Column (squares 11-19)
    if (index <= 19) {
        return { gridRow: 21 - index, gridColumn: 1 };
    }

    // Top Row (squares 20-30)
    if (index <= 30) {
        return { gridRow: 1, gridColumn: index - 19 };
    }

    // Right Column (squares 31-39)
    if (index <= 39) {
        return { gridRow: index - 29, gridColumn: 11 };
    }

    return {};
};

export default Monopoly;
