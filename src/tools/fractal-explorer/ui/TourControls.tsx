import React from 'react';
import { TourState } from '../logic/TourController';
import { Tour, TourStop } from '../data/TourData';

interface TourControlsProps {
    tour: Tour;
    state: TourState;
    currentStop: TourStop | null;
    onPrevious: () => void;
    onNext: () => void;
    onGoToStop: (index: number) => void;
    onToggleAutoAdvance: () => void;
    onClose: () => void;
}

export const TourControls: React.FC<TourControlsProps> = ({
    tour,
    state,
    currentStop,
    onPrevious,
    onNext,
    onGoToStop,
    onToggleAutoAdvance,
    onClose
}) => {
    const containerStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderRadius: 12,
        padding: '16px 24px',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        minWidth: 320,
        maxWidth: '90vw',
        zIndex: 20,
        fontFamily: 'system-ui, -apple-system, sans-serif'
    };

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
    };

    const titleStyle: React.CSSProperties = {
        fontSize: '1.1em',
        fontWeight: 'bold'
    };

    const descriptionStyle: React.CSSProperties = {
        fontSize: '0.85em',
        color: '#aaa',
        textAlign: 'center',
        maxWidth: 280,
        lineHeight: 1.4
    };

    const navStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: 16
    };

    const buttonStyle: React.CSSProperties = {
        backgroundColor: '#444',
        color: 'white',
        border: 'none',
        borderRadius: 6,
        padding: '8px 16px',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.2s'
    };

    const disabledButtonStyle: React.CSSProperties = {
        ...buttonStyle,
        opacity: 0.4,
        cursor: 'not-allowed'
    };

    const closeButtonStyle: React.CSSProperties = {
        background: 'none',
        border: 'none',
        color: '#888',
        fontSize: '1.4em',
        cursor: 'pointer',
        padding: '0 4px',
        lineHeight: 1
    };

    const progressStyle: React.CSSProperties = {
        display: 'flex',
        gap: 6,
        alignItems: 'center'
    };

    const dotStyle = (index: number): React.CSSProperties => ({
        width: 10,
        height: 10,
        borderRadius: '50%',
        backgroundColor: index === state.currentStopIndex ? '#4a9eff' : '#555',
        cursor: state.isAnimating ? 'default' : 'pointer',
        transition: 'background-color 0.2s, transform 0.2s',
        transform: index === state.currentStopIndex ? 'scale(1.2)' : 'scale(1)'
    });

    const footerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        fontSize: '0.85em',
        color: '#888'
    };

    const checkboxLabelStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer'
    };

    const phaseIndicatorStyle: React.CSSProperties = {
        fontSize: '0.75em',
        color: '#666',
        textTransform: 'capitalize'
    };

    const isFirstStop = state.currentStopIndex === 0;
    const isLastStop = state.currentStopIndex === tour.stops.length - 1;

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <span style={titleStyle}>
                    {currentStop?.name ?? tour.name}
                </span>
                <button style={closeButtonStyle} onClick={onClose} title="Close tour">
                    &times;
                </button>
            </div>

            {currentStop && (
                <div style={descriptionStyle}>
                    {currentStop.description}
                </div>
            )}

            <div style={navStyle}>
                <button
                    style={isFirstStop || state.isAnimating ? disabledButtonStyle : buttonStyle}
                    onClick={onPrevious}
                    disabled={isFirstStop || state.isAnimating}
                >
                    &larr; Previous
                </button>

                <div style={progressStyle}>
                    {tour.stops.map((stop, index) => (
                        <div
                            key={stop.id}
                            style={dotStyle(index)}
                            onClick={() => !state.isAnimating && onGoToStop(index)}
                            title={stop.name}
                        />
                    ))}
                </div>

                <button
                    style={isLastStop || state.isAnimating ? disabledButtonStyle : buttonStyle}
                    onClick={onNext}
                    disabled={isLastStop || state.isAnimating}
                >
                    Next &rarr;
                </button>
            </div>

            <div style={footerStyle}>
                <label style={checkboxLabelStyle}>
                    <input
                        type="checkbox"
                        checked={state.autoAdvance}
                        onChange={onToggleAutoAdvance}
                        disabled={state.isAnimating}
                    />
                    Auto-advance
                </label>

                <span>
                    {state.currentStopIndex + 1} / {tour.stops.length}
                </span>

                {state.isAnimating && (
                    <span style={phaseIndicatorStyle}>
                        {state.animationPhase}...
                    </span>
                )}
            </div>
        </div>
    );
};
