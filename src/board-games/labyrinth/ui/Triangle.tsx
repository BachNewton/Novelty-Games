import { useState } from "react";

interface TriangleProps {
    rotation: number;
    onClick: () => void;
}

const Triangle: React.FC<TriangleProps> = ({ rotation, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    const style: React.CSSProperties = {
        display: 'flex',
        transform: `rotate(${rotation}deg)`
    };

    if (isHovered) {
        style.outline = '4px solid white';
    }

    return <div style={style} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={onClick}>
        <div style={{
            backgroundImage: 'linear-gradient(60deg, transparent 50%, var(--novelty-blue) 50%)',
            width: '100%'
        }} />
        <div style={{
            backgroundImage: 'linear-gradient(-60deg, transparent 50%, teal 50%)',
            width: '100%'
        }} />
    </div>;
};

export default Triangle;
