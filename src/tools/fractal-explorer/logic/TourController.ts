import { Tour, TourStop } from '../data/TourData';
import { ArbitraryCoordinate, createArbitraryCoordinate } from './ArbitraryCoordinate';
import { createTourAnimator, AnimationPhase } from './TourAnimator';

export interface TourState {
    isActive: boolean;
    currentStopIndex: number;
    isAnimating: boolean;
    animationPhase: AnimationPhase;
    autoAdvance: boolean;
    autoAdvanceDelay: number;
}

export interface TourController {
    loadTour: (tour: Tour) => void;
    goToStop: (index: number, currentViewport: ArbitraryCoordinate) => void;
    nextStop: (currentViewport: ArbitraryCoordinate) => void;
    previousStop: (currentViewport: ArbitraryCoordinate) => void;
    setAutoAdvance: (enabled: boolean) => void;
    setAutoAdvanceDelay: (ms: number) => void;
    getState: () => TourState;
    getTour: () => Tour | null;
    getCurrentStop: () => TourStop | null;
    setOnViewportChange: (handler: (coord: ArbitraryCoordinate) => void) => void;
    setOnStopChange: (handler: (stop: TourStop, index: number) => void) => void;
    setOnStateChange: (handler: (state: TourState) => void) => void;
    stop: () => void;
}

export function createTourController(): TourController {
    let tour: Tour | null = null;
    let state: TourState = {
        isActive: false,
        currentStopIndex: 0,
        isAnimating: false,
        animationPhase: 'idle',
        autoAdvance: false,
        autoAdvanceDelay: 5000
    };

    let onViewportChange: ((coord: ArbitraryCoordinate) => void) | null = null;
    let onStopChange: ((stop: TourStop, index: number) => void) | null = null;
    let onStateChange: ((state: TourState) => void) | null = null;

    const animator = createTourAnimator();
    let autoAdvanceTimeoutId: number | null = null;

    const notifyStateChange = () => {
        if (onStateChange) {
            onStateChange({ ...state });
        }
    };

    const clearAutoAdvanceTimeout = () => {
        if (autoAdvanceTimeoutId !== null) {
            clearTimeout(autoAdvanceTimeoutId);
            autoAdvanceTimeoutId = null;
        }
    };

    const scheduleAutoAdvance = (currentViewport: ArbitraryCoordinate) => {
        if (!state.autoAdvance || !tour) return;

        clearAutoAdvanceTimeout();

        if (state.currentStopIndex < tour.stops.length - 1) {
            autoAdvanceTimeoutId = window.setTimeout(() => {
                if (state.autoAdvance && tour) {
                    goToStop(state.currentStopIndex + 1, currentViewport);
                }
            }, state.autoAdvanceDelay);
        }
    };

    const goToStop = (index: number, currentViewport: ArbitraryCoordinate) => {
        if (!tour || index < 0 || index >= tour.stops.length) return;

        clearAutoAdvanceTimeout();
        animator.cancel();

        const targetStop = tour.stops[index];
        state.currentStopIndex = index;
        state.isAnimating = true;
        state.animationPhase = 'zoom-out';
        notifyStateChange();

        animator.animateTo(
            currentViewport,
            targetStop,
            (coord) => {
                const animState = animator.getState();
                state.animationPhase = animState.phase;
                if (onViewportChange) onViewportChange(coord);
            },
            () => {
                state.isAnimating = false;
                state.animationPhase = 'idle';
                notifyStateChange();

                if (onStopChange) onStopChange(targetStop, index);

                const destViewport = createArbitraryCoordinate(
                    targetStop.real,
                    targetStop.imag,
                    targetStop.zoom
                );
                scheduleAutoAdvance(destViewport);
            }
        );
    };

    return {
        loadTour: (newTour: Tour) => {
            animator.cancel();
            clearAutoAdvanceTimeout();
            tour = newTour;
            state = {
                isActive: true,
                currentStopIndex: 0,
                isAnimating: false,
                animationPhase: 'idle',
                autoAdvance: state.autoAdvance,
                autoAdvanceDelay: state.autoAdvanceDelay
            };
            notifyStateChange();
        },

        goToStop,

        nextStop: (currentViewport: ArbitraryCoordinate) => {
            if (!tour || state.currentStopIndex >= tour.stops.length - 1) return;
            goToStop(state.currentStopIndex + 1, currentViewport);
        },

        previousStop: (currentViewport: ArbitraryCoordinate) => {
            if (!tour || state.currentStopIndex <= 0) return;
            goToStop(state.currentStopIndex - 1, currentViewport);
        },

        setAutoAdvance: (enabled: boolean) => {
            state.autoAdvance = enabled;
            if (!enabled) clearAutoAdvanceTimeout();
            notifyStateChange();
        },

        setAutoAdvanceDelay: (ms: number) => {
            state.autoAdvanceDelay = ms;
            notifyStateChange();
        },

        getState: () => ({ ...state }),
        getTour: () => tour,
        getCurrentStop: () => tour?.stops[state.currentStopIndex] ?? null,

        setOnViewportChange: (handler) => { onViewportChange = handler; },
        setOnStopChange: (handler) => { onStopChange = handler; },
        setOnStateChange: (handler) => { onStateChange = handler; },

        stop: () => {
            animator.cancel();
            clearAutoAdvanceTimeout();
            state = {
                isActive: false,
                currentStopIndex: 0,
                isAnimating: false,
                animationPhase: 'idle',
                autoAdvance: false,
                autoAdvanceDelay: state.autoAdvanceDelay
            };
            tour = null;
            notifyStateChange();
        }
    };
}
