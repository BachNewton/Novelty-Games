import React from "react";

interface CenterBoardProps {
    children: React.ReactNode;
}

const CenterBoard: React.FC<CenterBoardProps> = ({ children }) => {
    return <div style={{
        gridRow: '2 / span 9',
        gridColumn: '2 / span 9'
    }}>
        {children}
    </div>;
};

export default CenterBoard;
