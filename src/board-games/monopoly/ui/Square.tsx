import React from "react";
import { Side, Square as SquareData } from "../data/Square";

const STREET_COLOR_WIDTH = 12;

interface SquareProps {
    data: SquareData;
}

const Square: React.FC<SquareProps> = ({ data }) => {
    return <div style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        ...getBorder(data)
    }}>
        {data.name}
    </div>;
};

function getBorder(street: SquareData): React.CSSProperties {
    if (street.type !== 'street') return {};

    const border = `${STREET_COLOR_WIDTH}px solid ${street.color}`;

    switch (street.side) {
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

export default Square;
