import { useState, useRef, useCallback, useEffect } from 'react';
import { PrimeStatistics, WorkerStateInfo } from '../data/MessageTypes';
import { createPrimeCoordinator, PrimeCoordinator } from '../logic/PrimeCoordinator';
import StatisticsPanel from './StatisticsPanel';
import WorkerActivityPanel from './WorkerActivityPanel';
import UlamSpiralCanvas from './UlamSpiralCanvas';
import { updateRoute, Route } from '../../../ui/Routing';

const initialStatistics: PrimeStatistics = {
    totalPrimesFound: 0,
    largestPrime: 0,
    highestNumberChecked: 0,
    primesPerSecond: 0,
    elapsedTimeMs: 0,
    totalNumbersChecked: 0
};

const PrimeFinderHome: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [statistics, setStatistics] = useState<PrimeStatistics>(initialStatistics);
    const [workerStates, setWorkerStates] = useState<WorkerStateInfo[]>([]);

    // Use a ref for primes to avoid re-renders on every batch
    const primesRef = useRef<Set<number>>(new Set());
    const coordinatorRef = useRef<PrimeCoordinator | null>(null);

    useEffect(() => {
        updateRoute(Route.PRIME_FINDER);
    }, []);

    const handleStart = useCallback(() => {
        if (coordinatorRef.current) return;

        const coordinator = createPrimeCoordinator({
            onPrimesDiscovered: (newPrimes) => {
                // Add to ref without triggering re-render
                for (const prime of newPrimes) {
                    primesRef.current.add(prime);
                }
            },
            onStatisticsUpdate: setStatistics,
            onWorkerStatesUpdate: setWorkerStates
        });

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

    const mainContentStyle: React.CSSProperties = {
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
    };

    const leftPanelStyle: React.CSSProperties = {
        width: '240px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflowY: 'auto'
    };

    const spiralContainerStyle: React.CSSProperties = {
        flex: 1,
        position: 'relative',
        margin: '16px',
        marginLeft: 0,
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)'
    };

    const bottomPanelStyle: React.CSSProperties = {
        padding: '16px',
        paddingTop: 0
    };

    const instructionsStyle: React.CSSProperties = {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '0.8em',
        fontFamily: 'monospace',
        textAlign: 'center',
        padding: '8px'
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

            <div style={mainContentStyle}>
                <div style={leftPanelStyle}>
                    <StatisticsPanel statistics={statistics} />
                    <div style={instructionsStyle}>
                        Drag to pan, scroll to zoom
                    </div>
                </div>

                <div style={spiralContainerStyle}>
                    <UlamSpiralCanvas primesRef={primesRef} />
                </div>
            </div>

            <div style={bottomPanelStyle}>
                <WorkerActivityPanel workerStates={workerStates} />
            </div>
        </div>
    );
};

export default PrimeFinderHome;
