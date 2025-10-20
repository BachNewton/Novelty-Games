import React from "react";
import { Ride } from "../data/Ride";
import { calculateScore } from "../logic/ScoreCalculator";
import { DistanceUnit, Save, TemperatureUnit } from "../data/Save";
import { riderDisplayName, toFahrenheit, toMiles } from "../logic/Converter";

interface LogProps {
    rides: Ride[];
    save: Save;
}

const HEADER_STYLE: React.CSSProperties = {
    fontWeight: 'bold',
    textAlign: 'center',
    position: 'sticky',
    top: 0,
    padding: '2px',
    border: '2px solid var(--novelty-blue)',
    backgroundColor: 'var(--novelty-background)',
    color: 'var(--novelty-orange)'
};

const CELL_STYLE: React.CSSProperties = {
    border: '1px solid grey',
    padding: '2px'
};

const NUMBER_CELL_STYLE: React.CSSProperties = {
    ...CELL_STYLE,
    textAlign: 'right'
};

const Log: React.FC<LogProps> = ({ rides, save }) => {
    const distanceUnitDisplay = save.distanceUnit === DistanceUnit.KM ? 'km' : 'mi';
    const temperatureUnitDisplay = save.temperatureUnit === TemperatureUnit.CELSIUS ? '°C' : '°F';

    const rows = rides.map((ride, index) => {
        const distance = save.distanceUnit === DistanceUnit.MILE ? toMiles(ride.distance) : ride.distance;
        const temperature = save.temperatureUnit === TemperatureUnit.FAHRENHEIT ? toFahrenheit(ride.temperature) : ride.temperature;

        return <React.Fragment key={index}>
            <div style={CELL_STYLE}>{riderDisplayName(ride.rider)}</div>
            <div style={CELL_STYLE}>{new Date(ride.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            <div style={NUMBER_CELL_STYLE}>{distance.toFixed(0)}</div>
            <div style={NUMBER_CELL_STYLE}>{temperature.toFixed(0)}</div>
            <div style={NUMBER_CELL_STYLE}>{calculateScore(ride.distance, ride.temperature, DistanceUnit.KM, TemperatureUnit.CELSIUS).toLocaleString()}</div>
        </React.Fragment>;
    });

    return <div style={{
        height: '100%',
        padding: '15px',
        boxSizing: 'border-box'
    }}>
        <div style={{
            maxHeight: '100%',
            boxSizing: 'border-box',
            border: '2px solid var(--novelty-blue)',
            borderRadius: '15px',
            overflow: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)'
        }}>
            <div style={HEADER_STYLE}>Rider</div>
            <div style={HEADER_STYLE}>Date</div>
            <div style={HEADER_STYLE}>{distanceUnitDisplay}</div>
            <div style={HEADER_STYLE}>{temperatureUnitDisplay}</div>
            <div style={HEADER_STYLE}>Score</div>

            {rows}
        </div>
    </div>;
};

export default Log;
