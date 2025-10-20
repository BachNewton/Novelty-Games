import React from "react";
import { Ride } from "../data/Ride";
import { calculateScore } from "../logic/ScoreCalculator";
import { DistanceUnit, TemperatureUnit } from "../data/Save";

interface LogProps {
    rides: Ride[];
}

const HEADER_STYLE: React.CSSProperties = {
    fontWeight: 'bold',
    textAlign: 'center',
    position: 'sticky',
    top: 0
};

const CELL_STYLE: React.CSSProperties = {
    border: '1px solid white',
    padding: '2px'
};

const Log: React.FC<LogProps> = ({ rides }) => {
    const rows = rides.map((ride, index) => <React.Fragment key={index}>
        <div style={CELL_STYLE}>{ride.rider}</div>
        <div style={CELL_STYLE}>{new Date(ride.date).toLocaleDateString()}</div>
        <div style={CELL_STYLE}>{ride.distance}</div>
        <div style={CELL_STYLE}>{ride.temperature}</div>
        <div style={CELL_STYLE}>{calculateScore(ride.distance, ride.temperature, DistanceUnit.KM, TemperatureUnit.CELSIUS)}</div>
    </React.Fragment>);

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
            overflow: 'auto',
            // display: 'flex',
            // flexDirection: 'column'
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
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
            </div>

            {/* <div style={{
                flexGrow: 1,
                overflow: 'auto'
            }}>
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
                {rows}
            </div> */}
        </div>
    </div>;
};

export default Log;
