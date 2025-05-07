import React from 'react';
import '../css/flare.css';

interface DifficultyProps {
    level: number;
    isSelected: boolean;
}

const Difficulty: React.FC<DifficultyProps> = ({ level, isSelected }) => {
    const circles = Array.from({ length: 5 }, (_, index) => (
        <Circle key={index} filled={index < level} flare={level === 6} isSelected={isSelected} />
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
    isSelected: boolean;
}

const Circle: React.FC<CircleProps> = ({ filled, flare, isSelected }) => {
    const color = isSelected ? 'white' : 'grey';

    const circleStyle: React.CSSProperties = {
        border: `1px solid ${color}`,
        borderRadius: '100%',
        aspectRatio: 1,
        width: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    };

    const filledStyle: React.CSSProperties = {
        backgroundColor: isSelected ? flare ? 'var(--novelty-orange)' : 'white' : 'grey',
        borderRadius: '100%',
        width: '70%',
        aspectRatio: 1,
    };

    const flareClass = isSelected ? 'flare' : 'grey-flare';

    return (
        <div style={circleStyle}>
            {flare && <div className={flareClass} />}
            {filled && <div style={filledStyle} />}
        </div>
    );
};

export default Difficulty;
