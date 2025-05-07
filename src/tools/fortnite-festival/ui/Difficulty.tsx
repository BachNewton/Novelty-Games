import React from 'react';

interface DifficultyProps {
    level: number;
}

const Difficulty: React.FC<DifficultyProps> = ({ level }) => {
    const circles = Array.from({ length: 5 }, (_, index) => (
        <Circle key={index} filled={index < level} />
    ));

    return (
        <div style={{ display: 'flex', gap: '4px' }}>
            {circles}
        </div>
    );
};

interface CircleProps {
    filled: boolean;
}

const Circle: React.FC<CircleProps> = ({ filled }) => {
    const circleStyle = {
        border: '1px solid white',
        borderRadius: '100%',
        aspectRatio: 1,
        width: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    const filledStyle = {
        backgroundColor: 'white',
        borderRadius: '100%',
        width: '70%',
        aspectRatio: 1,
    };

    return (
        <div style={circleStyle}>
            {filled && <div style={filledStyle} />}
        </div>
    );
};

export default Difficulty;
