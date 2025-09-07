import { MonopolyState } from "../data/MonopolyState";

interface MonopolyProps {
    state: MonopolyState;
}

const Monopoly: React.FC<MonopolyProps> = ({ state }) => {
    const squares = state.board.map((square, index) => (
        <div key={index} style={{
            ...getGridPosition(index),
            border: '1px solid white',
            padding: '5px',
            boxSizing: 'border-box'
        }}>
            {square.name}
        </div>
    ));

    const center = <div style={{
        gridRow: '2 / span 9',
        gridColumn: '2 / span 9',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '2em'
    }}>
        This is the Monopoly board!
    </div>

    return <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(11, 1fr)',
        gridTemplateRows: 'repeat(11, 1fr)'
    }}>
        {squares}
        {center}
    </div>;
};

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
