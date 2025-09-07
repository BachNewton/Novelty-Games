import React from "react";
import { Side, Square as SquareData } from "../data/Square";
import GoIcon from '../icon/go.png';

const STREET_COLOR_WIDTH = 12;

interface SquareProps {
    data: SquareData;
}

const Square: React.FC<SquareProps> = ({ data }) => {
    return <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        ...getBorder(data)
    }}>
        {getContent(data)}
    </div>;
};

function getBorder(data: SquareData): React.CSSProperties {
    if (data.type !== 'street') return {};

    const border = `${STREET_COLOR_WIDTH}px solid ${data.color}`;

    switch (data.side) {
        case Side.BOTTOM:
            return { borderTop: border };
        case Side.LEFT:
            return { borderRight: border };
        case Side.TOP:
            return { borderBottom: border };
        case Side.RIGHT:
            return { borderLeft: border };
    }
}

function getContent(data: SquareData): React.ReactNode {
    switch (data.type) {
        case 'go':
            return <img src={GoIcon} alt="Go" style={{ width: '75%', height: '75%' }} />;
    }
}

export default Square;
