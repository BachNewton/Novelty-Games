import { useState, useRef, useCallback, useEffect } from 'react';
import { PrimeFinderData } from '../data/MessageTypes';
import { createPrimeCoordinator, PrimeCoordinator } from '../logic/PrimeCoordinator';
import PrimeCanvas from './PrimeCanvas';
import { updateRoute, Route } from '../../../ui/Routing';

const initialData: PrimeFinderData = {
    latestPrime: 0,
    totalPrimesFound: 0,
    highestNumberChecked: 0,
    primesPerSecond: 0,
    startTime: 0,
    workerStates: []
};

const PrimeFinderHome: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);

    const dataRef = useRef<PrimeFinderData>({ ...initialData });
    const coordinatorRef = useRef<PrimeCoordinator | null>(null);

    useEffect(() => {
        updateRoute(Route.PRIME_FINDER);
    }, []);

    const handleStart = useCallback(() => {
        if (coordinatorRef.current) return;

        const coordinator = createPrimeCoordinator(dataRef);
        coordinatorRef.current = coordinator;
        coordinator.start();
        setIsRunning(true);
    }, []);

    const handleStop = useCallback(() => {
        if (!coordinatorRef.current) return;

        coordinatorRef.current.stop();
        coordinatorRef.current = null;
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

    const buttonStyle: React.CSSProperties = {
        padding: '10px 24px',
        fontSize: '1em',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: isRunning ? '#ef5350' : '#4caf50',
        color: 'white'
    };

    const canvasContainerStyle: React.CSSProperties = {
        flex: 1,
        overflow: 'hidden'
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div style={titleStyle}>Prime Number Finder</div>
                <button
                    style={buttonStyle}
                    onClick={isRunning ? handleStop : handleStart}
                >
                    {isRunning ? 'Stop' : 'Start'}
                </button>
            </div>

            <div style={canvasContainerStyle}>
                <PrimeCanvas dataRef={dataRef} isRunning={isRunning} />
            </div>
        </div>
    );
};

export default PrimeFinderHome;
