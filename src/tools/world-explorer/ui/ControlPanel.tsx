import { useState, useCallback } from 'react';

interface ControlPanelProps {
    seed: number;
    onSeedChange: (seed: number) => void;
    coordinates: { x: number; y: number; zoom: number };
}

const ControlPanel: React.FC<ControlPanelProps> = ({ seed, onSeedChange, coordinates }) => {
    const [seedInput, setSeedInput] = useState(seed.toString());
    const [isExpanded, setIsExpanded] = useState(true);

    const handleSeedSubmit = useCallback(() => {
        const newSeed = parseInt(seedInput, 10);
        if (!isNaN(newSeed)) {
            onSeedChange(newSeed);
        }
    }, [seedInput, onSeedChange]);

    const handleRandomSeed = useCallback(() => {
        const newSeed = Math.floor(Math.random() * 1000000);
        setSeedInput(newSeed.toString());
        onSeedChange(newSeed);
    }, [onSeedChange]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSeedSubmit();
        }
    }, [handleSeedSubmit]);

    const panelStyle: React.CSSProperties = {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(244, 228, 188, 0.95)',
        borderRadius: 8,
        padding: isExpanded ? 15 : 10,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        fontFamily: 'Georgia, serif',
        color: '#2a1a0a',
        minWidth: isExpanded ? 200 : 'auto',
        border: '2px solid #8b7355'
    };

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isExpanded ? 10 : 0,
        cursor: 'pointer'
    };

    const titleStyle: React.CSSProperties = {
        fontSize: 16,
        fontWeight: 'bold',
        margin: 0
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '6px 10px',
        border: '1px solid #8b7355',
        borderRadius: 4,
        fontFamily: 'Georgia, serif',
        fontSize: 14,
        backgroundColor: '#fff',
        boxSizing: 'border-box'
    };

    const buttonStyle: React.CSSProperties = {
        padding: '6px 12px',
        backgroundColor: '#8b7355',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        fontFamily: 'Georgia, serif',
        fontSize: 13,
        marginRight: 5
    };

    const labelStyle: React.CSSProperties = {
        fontSize: 12,
        color: '#5a4a3a',
        marginBottom: 4,
        display: 'block'
    };

    const coordStyle: React.CSSProperties = {
        fontSize: 11,
        color: '#5a4a3a',
        marginTop: 10,
        fontFamily: 'monospace'
    };

    return (
        <div style={panelStyle}>
            <div style={headerStyle} onClick={() => setIsExpanded(!isExpanded)}>
                <h3 style={titleStyle}>World Explorer</h3>
                <span style={{ fontSize: 14 }}>{isExpanded ? '−' : '+'}</span>
            </div>

            {isExpanded && (
                <>
                    <div style={{ marginBottom: 10 }}>
                        <label style={labelStyle}>World Seed</label>
                        <input
                            type="text"
                            value={seedInput}
                            onChange={(e) => setSeedInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            style={inputStyle}
                            placeholder="Enter seed..."
                        />
                    </div>

                    <div style={{ marginBottom: 10 }}>
                        <button style={buttonStyle} onClick={handleSeedSubmit}>
                            Apply
                        </button>
                        <button style={buttonStyle} onClick={handleRandomSeed}>
                            Random
                        </button>
                    </div>

                    <div style={coordStyle}>
                        <div>X: {coordinates.x.toFixed(1)}</div>
                        <div>Y: {coordinates.y.toFixed(1)}</div>
                        <div>Zoom: {coordinates.zoom.toFixed(2)}x</div>
                    </div>

                    <div style={{ marginTop: 10, fontSize: 11, color: '#7a6a5a' }}>
                        Drag to pan, scroll to zoom
                    </div>
                </>
            )}
        </div>
    );
};

export default ControlPanel;
