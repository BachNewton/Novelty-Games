import React from 'react';
import { RenderMode, RenderProgress } from '../logic/FractalRenderer';

interface ZoomIndicatorProps {
    zoom: number;
    renderMode: RenderMode;
    renderProgress: RenderProgress | null;
}

function formatZoom(zoom: number): string {
    if (zoom < 1000) {
        return `${zoom.toFixed(1)}x`;
    }

    const exponent = Math.log10(zoom);
    const mantissa = Math.pow(10, exponent - Math.floor(exponent));

    // Show as "1.23 x 10^4" format for precision
    return `${mantissa.toFixed(2)} x 10^${Math.floor(exponent)}`;
}

export const ZoomIndicator: React.FC<ZoomIndicatorProps> = ({
    zoom,
    renderMode,
    renderProgress
}) => {
    const containerStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: 16,
        left: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none'
    };

    const badgeStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '6px 12px',
        borderRadius: 4,
        fontSize: 12,
        fontFamily: 'monospace'
    };

    const modeStyle: React.CSSProperties = {
        padding: '2px 6px',
        borderRadius: 3,
        fontSize: 10,
        fontWeight: 'bold',
        backgroundColor: renderMode === 'gpu' ? '#4a4' : '#aa4',
        color: renderMode === 'gpu' ? '#fff' : '#000'
    };

    const progressStyle: React.CSSProperties = {
        ...badgeStyle,
        flexDirection: 'column',
        alignItems: 'flex-start'
    };

    const progressBarContainer: React.CSSProperties = {
        width: 120,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        overflow: 'hidden'
    };

    const progressBarFill: React.CSSProperties = {
        height: '100%',
        backgroundColor: '#aa4',
        borderRadius: 2,
        transition: 'width 0.1s ease-out',
        width: `${renderProgress?.percentComplete || 0}%`
    };

    return (
        <div style={containerStyle}>
            <div style={badgeStyle}>
                <span>Zoom: {formatZoom(zoom)}</span>
                <span style={modeStyle}>{renderMode.toUpperCase()}</span>
            </div>

            {renderMode === 'cpu' && renderProgress && (
                <div style={progressStyle}>
                    <span>
                        Pass {renderProgress.currentPass}/{renderProgress.totalPasses}
                        {' '}({Math.round(renderProgress.percentComplete)}%)
                    </span>
                    <div style={progressBarContainer}>
                        <div style={progressBarFill} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ZoomIndicator;
