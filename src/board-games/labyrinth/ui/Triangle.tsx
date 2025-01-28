interface TriangleProps {
    rotation: number;
}

const Triangle: React.FC<TriangleProps> = ({ rotation }) => {
    return <div style={{ display: 'flex', transform: `rotate(${rotation}deg)` }}>
        <div style={{
            backgroundImage: 'linear-gradient(60deg, transparent 50%, #3498db 50%)',
            width: '100%'
        }} />
        <div style={{
            backgroundImage: 'linear-gradient(-60deg, transparent 50%, teal 50%)',
            width: '100%'
        }} />
    </div>;
};

export default Triangle;
