import { FractalType, FRACTAL_CONFIGS } from '../data/FractalTypes';
import { ColorPalette, COLOR_PALETTES } from '../data/ColorPalettes';

interface ControlPanelProps {
    fractalType: FractalType;
    paletteId: string;
    onFractalTypeChange: (type: FractalType) => void;
    onPaletteChange: (paletteId: string) => void;
    onClose: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    fractalType,
    paletteId,
    onFractalTypeChange,
    onPaletteChange,
    onClose
}) => {
    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 100
    };

    const panelStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '280px',
        backgroundColor: '#1a1a2e',
        color: 'white',
        padding: '20px',
        overflowY: 'auto',
        zIndex: 101,
        boxShadow: '2px 0 10px rgba(0,0,0,0.5)'
    };

    const headerStyle: React.CSSProperties = {
        fontSize: '1.5em',
        fontWeight: 'bold',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    const closeButtonStyle: React.CSSProperties = {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '1.5em',
        cursor: 'pointer',
        padding: '5px 10px'
    };

    const sectionStyle: React.CSSProperties = {
        marginBottom: '24px'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: 'bold',
        fontSize: '0.9em',
        color: '#aaa'
    };

    const selectStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px',
        fontSize: '1em',
        backgroundColor: '#2a2a4a',
        color: 'white',
        border: '1px solid #444',
        borderRadius: '6px',
        cursor: 'pointer'
    };

    const descriptionStyle: React.CSSProperties = {
        fontSize: '0.8em',
        color: '#888',
        marginTop: '4px'
    };

    const fractalTypes = Object.keys(FRACTAL_CONFIGS) as FractalType[];

    return (
        <>
            <div style={overlayStyle} onClick={onClose} />
            <div style={panelStyle}>
                <div style={headerStyle}>
                    <span>Settings</span>
                    <button style={closeButtonStyle} onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div style={sectionStyle}>
                    <label style={labelStyle}>Fractal Type</label>
                    <select
                        style={selectStyle}
                        value={fractalType}
                        onChange={(e) => onFractalTypeChange(e.target.value as FractalType)}
                    >
                        {fractalTypes.map((type) => (
                            <option key={type} value={type}>
                                {FRACTAL_CONFIGS[type].name}
                            </option>
                        ))}
                    </select>
                    <div style={descriptionStyle}>
                        {FRACTAL_CONFIGS[fractalType].description}
                    </div>
                </div>

                <div style={sectionStyle}>
                    <label style={labelStyle}>Color Palette</label>
                    <select
                        style={selectStyle}
                        value={paletteId}
                        onChange={(e) => onPaletteChange(e.target.value)}
                    >
                        {COLOR_PALETTES.map((palette: ColorPalette) => (
                            <option key={palette.id} value={palette.id}>
                                {palette.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ ...sectionStyle, marginTop: '40px', color: '#666', fontSize: '0.85em' }}>
                    <div style={{ marginBottom: '8px' }}>
                        <strong>Controls:</strong>
                    </div>
                    <div>Drag to pan</div>
                    <div>Scroll/pinch to zoom</div>
                </div>

            </div>
        </>
    );
};
