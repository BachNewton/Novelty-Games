import React from 'react';
import '../css/flare.css';

interface DifficultyProps {
    level: number;
}

const Difficulty: React.FC<DifficultyProps> = ({ level }) => {
    const circles = Array.from({ length: 5 }, (_, index) => (
        <Circle key={index} filled={index < level} flare={level === 6} />
    ));

    return (
        <div style={{ display: 'flex', gap: '4px', position: 'relative' }}>
            {circles}
        </div>
    );
};

interface CircleProps {
    filled: boolean;
    flare: boolean;
}

const Circle: React.FC<CircleProps> = ({ filled, flare }) => {
    const circleStyle: React.CSSProperties = {
        border: '1px solid white',
        borderRadius: '100%',
        aspectRatio: 1,
        width: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    };

    const filledStyle: React.CSSProperties = {
        backgroundColor: flare ? 'var(--novelty-orange)' : 'white',
        borderRadius: '100%',
        width: '70%',
        aspectRatio: 1,
    };

    return (
        <div style={circleStyle}>
            {flare && <div className="flare" />}
            {filled && <div style={filledStyle} />}
        </div>
    );
};

export default Difficulty;
