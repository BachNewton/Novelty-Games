import { useState, useRef, useCallback } from 'react';
import { PrimeFinderData } from '../data/MessageTypes';
import { createPrimeCoordinator, PrimeCoordinator } from '../logic/PrimeCoordinator';
import PrimeCanvas from './PrimeCanvas';

const initialData: PrimeFinderData = {
    latestPrime: 0,
    totalPrimesFound: 0,
    highestNumberChecked: 0,
    primesPerSecond: 0,
    startTime: 0,
    pausedElapsedTime: 0,
    workerStates: []
};

const PrimeFinderHome: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    const dataRef = useRef<PrimeFinderData>({ ...initialData });
    const coordinatorRef = useRef<PrimeCoordinator | null>(null);

    const handleStart = useCallback(() => {
        if (!coordinatorRef.current) {
            coordinatorRef.current = createPrimeCoordinator(dataRef);
        }

        coordinatorRef.current.start();
        setIsRunning(true);
        setHasStarted(true);
    }, []);

    const handlePause = useCallback(() => {
        if (!coordinatorRef.current) return;

        coordinatorRef.current.pause();
        setIsRunning(false);
    }, []);

    const handleResume = useCallback(() => {
        if (!coordinatorRef.current) return;

        coordinatorRef.current.resume();
        setIsRunning(true);
    }, []);

    const handleRestart = useCallback(() => {
        if (!coordinatorRef.current) return;

        coordinatorRef.current.restart();
        setHasStarted(false);
        setIsRunning(false);
    }, []);

    const containerStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1a1a2e',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
    };

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    };

    const titleStyle: React.CSSProperties = {
        color: 'white',
        fontSize: '1.2em',
        fontFamily: 'monospace',
        fontWeight: 'bold'
    };

    const baseButtonStyle: React.CSSProperties = {
        padding: '12px 24px',
        minHeight: '44px',
        fontSize: '1em',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        color: 'white',
        touchAction: 'manipulation'
    };

    const primaryButtonStyle: React.CSSProperties = {
        ...baseButtonStyle,
        backgroundColor: isRunning ? '#ff9800' : '#4caf50'
    };

    const restartButtonStyle: React.CSSProperties = {
        ...baseButtonStyle,
        backgroundColor: '#ef5350'
    };

    const canvasContainerStyle: React.CSSProperties = {
        flex: 1,
        overflow: 'hidden'
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div style={titleStyle}>Prime Number Finder</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {hasStarted && !isRunning && (
                        <button
                            style={restartButtonStyle}
                            onClick={handleRestart}
                        >
                            Restart
                        </button>
                    )}
                    <button
                        style={primaryButtonStyle}
                        onClick={isRunning ? handlePause : (hasStarted ? handleResume : handleStart)}
                    >
                        {isRunning ? 'Pause' : (hasStarted ? 'Resume' : 'Start')}
                    </button>
                </div>
            </div>

            <div style={canvasContainerStyle}>
                <PrimeCanvas dataRef={dataRef} isRunning={isRunning} />
            </div>
        </div>
    );
};

export default PrimeFinderHome;
