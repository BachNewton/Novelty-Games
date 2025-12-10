import { useState, useCallback } from 'react';
import { FractalCanvas } from './FractalCanvas';
import { ControlPanel } from './ControlPanel';
import { WorkerStats } from './WorkerStats';
import { FractalType } from '../data/FractalTypes';
import { WorkerStats as WorkerStatsData } from '../logic/WorkerPool';
import HomeButton from '../../../ui/HomeButton';

interface FractalExplorerHomeProps {
    onHomeButtonClicked: () => void;
}

interface Stats {
    workerStats: WorkerStatsData[];
    tilesCompleted: number;
    totalTiles: number;
    workerCount: number;
}

const FractalExplorerHome: React.FC<FractalExplorerHomeProps> = ({ onHomeButtonClicked }) => {
    const [fractalType, setFractalType] = useState<FractalType>('mandelbrot');
    const [paletteId, setPaletteId] = useState('classic');
    const [showWorkerOverlay, setShowWorkerOverlay] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [showControls, setShowControls] = useState(false);
    const [stats, setStats] = useState<Stats>({
        workerStats: [],
        tilesCompleted: 0,
        totalTiles: 0,
        workerCount: 0
    });

    const handleStatsUpdate = useCallback((newStats: Stats) => {
        setStats(newStats);
    }, []);

    const containerStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        overflow: 'hidden'
    };

    const canvasContainerStyle: React.CSSProperties = {
        width: '100%',
        height: '100%'
    };

    const settingsButtonStyle: React.CSSProperties = {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 16px',
        fontSize: '1em',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 10
    };

    const homeButtonContainerStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: 10,
        left: 10,
        zIndex: 10
    };

    const titleStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: 10,
        right: 10,
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '0.9em',
        fontFamily: 'monospace',
        zIndex: 10
    };

    return (
        <div style={containerStyle}>
            <div style={canvasContainerStyle}>
                <FractalCanvas
                    fractalType={fractalType}
                    paletteId={paletteId}
                    maxIterations={256}
                    showWorkerOverlay={showWorkerOverlay}
                    onStatsUpdate={handleStatsUpdate}
                />
            </div>

            <button
                style={settingsButtonStyle}
                onClick={() => setShowControls(true)}
            >
                <span style={{ fontSize: '1.2em' }}>&#9776;</span>
                <span>Settings</span>
            </button>

            {showStats && (
                <WorkerStats
                    workerStats={stats.workerStats}
                    tilesCompleted={stats.tilesCompleted}
                    totalTiles={stats.totalTiles}
                    workerCount={stats.workerCount}
                />
            )}

            {showControls && (
                <ControlPanel
                    fractalType={fractalType}
                    paletteId={paletteId}
                    showWorkerOverlay={showWorkerOverlay}
                    showStats={showStats}
                    onFractalTypeChange={setFractalType}
                    onPaletteChange={setPaletteId}
                    onWorkerOverlayToggle={() => setShowWorkerOverlay(!showWorkerOverlay)}
                    onStatsToggle={() => setShowStats(!showStats)}
                    onClose={() => setShowControls(false)}
                />
            )}

            <div style={homeButtonContainerStyle}>
                <HomeButton onClick={onHomeButtonClicked} />
            </div>

            <div style={titleStyle}>
                Fractal Explorer
            </div>
        </div>
    );
};

export default FractalExplorerHome;
