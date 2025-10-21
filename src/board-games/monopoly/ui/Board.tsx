import React from "react";

interface BoardProps {
    children: React.ReactNode;
}

const Board: React.FC<BoardProps> = ({ children }) => {
    return <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(11, 1fr)',
        gridTemplateRows: 'repeat(11, 1fr)',
        height: '100%'
    }}>
        {children}
    </div>;
};

export default Board;
