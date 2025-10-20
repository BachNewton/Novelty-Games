import { Ride } from "../data/Ride";

interface LogProps {
    rides: Ride[];
}

const HEADER_STYLE: React.CSSProperties = {
    fontWeight: 'bold',
    textAlign: 'center'
};

const CELL_STYLE: React.CSSProperties = {
    border: '1px solid white',
    padding: '2px'
};

const Log: React.FC<LogProps> = ({ rides }) => {
    const rows = rides.map((ride, index) => <div key={index} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)'
    }}>
        <div style={CELL_STYLE}>{ride.rider}</div>
        <div style={CELL_STYLE}>{new Date(ride.date).toLocaleDateString()}</div>
        <div style={CELL_STYLE}>{ride.distance}</div>
        <div style={CELL_STYLE}>{ride.temperature}</div>
        <div style={CELL_STYLE}>{12345}</div>
    </div>);

    return <div style={{
        height: '100%',
        padding: '15px',
        boxSizing: 'border-box'
    }}>
        <div style={{
            height: '100%',
            border: '1px solid white',
            borderRadius: '15px',
            padding: '10px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)'
            }}>
                <div style={HEADER_STYLE}>Rider</div>
                <div style={HEADER_STYLE}>Date</div>
                <div style={HEADER_STYLE}>Distance</div>
                <div style={HEADER_STYLE}>Temp</div>
                <div style={HEADER_STYLE}>Score</div>
            </div>

            <div style={{
                flexGrow: 1,
                overflow: 'auto'
            }}>
                {rows}
            </div>
        </div>
    </div>;
};

export default Log;
