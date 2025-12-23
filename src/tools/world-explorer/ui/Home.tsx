import { useState, useCallback } from 'react';
import WorldCanvas from './WorldCanvas';
import ControlPanel from './ControlPanel';

const Home: React.FC = () => {
    const [seed, setSeed] = useState(12345);
    const [coordinates, setCoordinates] = useState({ x: 0, y: 0, zoom: 4 });

    const handleCoordinateChange = useCallback((x: number, y: number, zoom: number) => {
        setCoordinates({ x, y, zoom });
    }, []);

    const handleSeedChange = useCallback((newSeed: number) => {
        setSeed(newSeed);
    }, []);

    const containerStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1a1a2e'
    };

    return (
        <div style={containerStyle}>
            <WorldCanvas
                seed={seed}
                onCoordinateChange={handleCoordinateChange}
            />
            <ControlPanel
                seed={seed}
                onSeedChange={handleSeedChange}
                coordinates={coordinates}
            />
        </div>
    );
};

export default Home;
