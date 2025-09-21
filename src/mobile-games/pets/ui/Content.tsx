import React from "react";
import { COLORS } from "./Home";

interface ContentProps {
    children: React.ReactNode;
}

const Content: React.FC<ContentProps> = ({ children }) => {
    return <div style={{
        height: '100%',
        background: `linear-gradient(180deg, ${COLORS.surface} 0px, transparent 7.5px)`
    }}>
        {children}
    </div>;
};

export default Content;
