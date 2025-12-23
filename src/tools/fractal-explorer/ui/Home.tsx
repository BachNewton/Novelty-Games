import { useState, useRef, useMemo, useCallback } from 'react';
import { FractalCanvas, ViewportControls } from './FractalCanvas';
import { ControlPanel } from './ControlPanel';
import { TourControls } from './TourControls';
import { FractalType } from '../data/FractalTypes';
import { MANDELBROT_TOUR } from '../data/TourData';
import { createTourController, TourState } from '../logic/TourController';

const FractalExplorerHome: React.FC = () => {
    const [fractalType, setFractalType] = useState<FractalType>('mandelbrot');
    const [paletteId, setPaletteId] = useState('classic');
    const [showControls, setShowControls] = useState(false);
    const [tourActive, setTourActive] = useState(false);
    const [tourState, setTourState] = useState<TourState | null>(null);

    const viewportControlsRef = useRef<ViewportControls | null>(null);

    const tourController = useMemo(() => {
        const controller = createTourController();
        controller.setOnStateChange(setTourState);
        controller.setOnViewportChange((coord) => {
            if (viewportControlsRef.current) {
                viewportControlsRef.current.setViewport(coord);
            }
        });
        return controller;
    }, []);

    const handleViewportReady = useCallback((controls: ViewportControls) => {
        viewportControlsRef.current = controls;
    }, []);

    const handleStartTour = useCallback(() => {
        setFractalType('mandelbrot');
        tourController.loadTour(MANDELBROT_TOUR);
        setTourActive(true);

        // Navigate to first stop
        if (viewportControlsRef.current) {
            const viewport = viewportControlsRef.current.getViewport();
            if (viewport) {
                tourController.goToStop(0, viewport);
            }
        }
    }, [tourController]);

    const handleCloseTour = useCallback(() => {
        tourController.stop();
        setTourActive(false);
    }, [tourController]);

    const handleTourPrevious = useCallback(() => {
        if (viewportControlsRef.current) {
            const viewport = viewportControlsRef.current.getViewport();
            if (viewport) {
                tourController.previousStop(viewport);
            }
        }
    }, [tourController]);

    const handleTourNext = useCallback(() => {
        if (viewportControlsRef.current) {
            const viewport = viewportControlsRef.current.getViewport();
            if (viewport) {
                tourController.nextStop(viewport);
            }
        }
    }, [tourController]);

    const handleTourGoToStop = useCallback((index: number) => {
        if (viewportControlsRef.current) {
            const viewport = viewportControlsRef.current.getViewport();
            if (viewport) {
                tourController.goToStop(index, viewport);
            }
        }
    }, [tourController]);

    const handleToggleAutoAdvance = useCallback(() => {
        if (tourState) {
            tourController.setAutoAdvance(!tourState.autoAdvance);
        }
    }, [tourController, tourState]);

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

    const buttonContainerStyle: React.CSSProperties = {
        position: 'absolute',
        top: 10,
        left: 10,
        display: 'flex',
        gap: 8,
        zIndex: 10
    };

    const buttonStyle: React.CSSProperties = {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 16px',
        fontSize: '1em',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
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
                    onViewportReady={handleViewportReady}
                />
            </div>

            <div style={buttonContainerStyle}>
                <button
                    style={buttonStyle}
                    onClick={() => setShowControls(true)}
                >
                    <span style={{ fontSize: '1.2em' }}>&#9776;</span>
                    <span>Settings</span>
                </button>

                {!tourActive && (
                    <button
                        style={buttonStyle}
                        onClick={handleStartTour}
                    >
                        <span>Tour</span>
                    </button>
                )}
            </div>

            {showControls && (
                <ControlPanel
                    fractalType={fractalType}
                    paletteId={paletteId}
                    onFractalTypeChange={setFractalType}
                    onPaletteChange={setPaletteId}
                    onClose={() => setShowControls(false)}
                />
            )}

            {tourActive && tourState && (
                <TourControls
                    tour={MANDELBROT_TOUR}
                    state={tourState}
                    currentStop={tourController.getCurrentStop()}
                    onPrevious={handleTourPrevious}
                    onNext={handleTourNext}
                    onGoToStop={handleTourGoToStop}
                    onToggleAutoAdvance={handleToggleAutoAdvance}
                    onClose={handleCloseTour}
                />
            )}

            <div style={titleStyle}>
                Fractal Explorer
            </div>
        </div>
    );
};

export default FractalExplorerHome;
