import { useState } from "react";

export interface MobileControlsCallbacks {
    onToggleAI: () => void;
    onToggleVisualization: () => void;
    onToggleHeadless: () => void;
    onRestart: () => void;
    onIncreaseSpeed: () => void;
    onDecreaseSpeed: () => void;
    onResetSpeed: () => void;
    onResetAI: () => void;
    getAIMode: () => boolean;
    getHeadlessMode: () => boolean;
    getSpeedMultiplier: () => number;
}

export function MobileControls({ callbacks }: { callbacks: MobileControlsCallbacks }) {
    const [isOpen, setIsOpen] = useState(false);

    const menuButtonStyle: React.CSSProperties = {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#3b82f6',
        border: 'none',
        color: 'white',
        fontSize: '24px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        zIndex: 1001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'manipulation',
        pointerEvents: 'auto',
        userSelect: 'auto'
    };

    const backdropStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        transition: 'opacity 0.2s ease'
    };

    const panelStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '280px',
        maxWidth: '80vw',
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        zIndex: 1000,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        pointerEvents: 'auto',
        userSelect: 'auto'
    };

    const headerStyle: React.CSSProperties = {
        color: '#60a5fa',
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '1px solid #60a5fa'
    };

    const buttonStyle: React.CSSProperties = {
        width: '100%',
        padding: '14px 16px',
        marginBottom: '10px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '16px',
        cursor: 'pointer',
        touchAction: 'manipulation',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    };

    const activeButtonStyle: React.CSSProperties = {
        ...buttonStyle,
        backgroundColor: '#22c55e',
        color: 'white'
    };

    const inactiveButtonStyle: React.CSSProperties = {
        ...buttonStyle,
        backgroundColor: '#374151',
        color: 'white'
    };

    const dangerButtonStyle: React.CSSProperties = {
        ...buttonStyle,
        backgroundColor: '#ef4444',
        color: 'white'
    };

    const speedControlStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px',
        gap: '10px'
    };

    const speedButtonStyle: React.CSSProperties = {
        width: '50px',
        height: '50px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#374151',
        color: 'white',
        fontSize: '24px',
        cursor: 'pointer',
        touchAction: 'manipulation'
    };

    const speedDisplayStyle: React.CSSProperties = {
        flex: 1,
        textAlign: 'center',
        color: 'white',
        fontSize: '16px'
    };

    const sectionStyle: React.CSSProperties = {
        marginBottom: '20px'
    };

    const sectionTitleStyle: React.CSSProperties = {
        color: '#9ca3af',
        fontSize: '12px',
        textTransform: 'uppercase',
        marginBottom: '10px'
    };

    const aiMode = callbacks.getAIMode();
    const headlessMode = callbacks.getHeadlessMode();
    const speedMultiplier = callbacks.getSpeedMultiplier();

    return (
        <div data-mobile-controls>
            {/* Backdrop */}
            <div style={backdropStyle} onClick={() => setIsOpen(false)} />

            {/* Slide-out Panel */}
            <div style={panelStyle}>
                <div style={headerStyle}>Snake Controls</div>

                {/* Game Controls */}
                <div style={sectionStyle}>
                    <div style={sectionTitleStyle}>Game</div>
                    <button
                        style={inactiveButtonStyle}
                        onClick={() => { callbacks.onRestart(); setIsOpen(false); }}
                    >
                        <span>Restart Game</span>
                        <span>↺</span>
                    </button>
                </div>

                {/* AI Controls */}
                <div style={sectionStyle}>
                    <div style={sectionTitleStyle}>AI Mode</div>
                    <button
                        style={aiMode ? activeButtonStyle : inactiveButtonStyle}
                        onClick={callbacks.onToggleAI}
                    >
                        <span>AI Control</span>
                        <span>{aiMode ? 'ON' : 'OFF'}</span>
                    </button>
                    <button
                        style={inactiveButtonStyle}
                        onClick={callbacks.onToggleVisualization}
                    >
                        <span>Show AI Dashboard</span>
                        <span>📊</span>
                    </button>
                    <button
                        style={headlessMode ? activeButtonStyle : inactiveButtonStyle}
                        onClick={callbacks.onToggleHeadless}
                        disabled={!aiMode}
                    >
                        <span>Headless Training</span>
                        <span>{headlessMode ? 'ON' : 'OFF'}</span>
                    </button>
                </div>

                {/* Speed Controls */}
                <div style={sectionStyle}>
                    <div style={sectionTitleStyle}>Speed: {speedMultiplier}x</div>
                    <div style={speedControlStyle}>
                        <button style={speedButtonStyle} onClick={callbacks.onDecreaseSpeed}>-</button>
                        <div style={speedDisplayStyle}>{speedMultiplier}x</div>
                        <button style={speedButtonStyle} onClick={callbacks.onIncreaseSpeed}>+</button>
                    </div>
                    <button
                        style={inactiveButtonStyle}
                        onClick={callbacks.onResetSpeed}
                    >
                        <span>Reset to 1x</span>
                        <span>⟲</span>
                    </button>
                </div>

                {/* Danger Zone */}
                <div style={sectionStyle}>
                    <div style={sectionTitleStyle}>Reset</div>
                    <button
                        style={dangerButtonStyle}
                        onClick={() => {
                            if (window.confirm('Reset AI learning? This will clear all progress.')) {
                                callbacks.onResetAI();
                            }
                        }}
                    >
                        <span>Reset AI Progress</span>
                        <span>⚠️</span>
                    </button>
                </div>
            </div>

            {/* Menu Button */}
            <button
                style={menuButtonStyle}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? '✕' : '☰'}
            </button>
        </div>
    );
}

export function createMobileControlsOverlay(callbacks: MobileControlsCallbacks): JSX.Element {
    return <MobileControls callbacks={callbacks} />;
}

export function createCombinedOverlay(
    aiVisualization: JSX.Element | null,
    mobileControls: JSX.Element
): JSX.Element {
    return <>
        {aiVisualization}
        {mobileControls}
    </>;
}
