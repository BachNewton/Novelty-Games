import { ArbitraryCoordinate, createArbitraryCoordinate } from './ArbitraryCoordinate';
import { TourStop } from '../data/TourData';
import { EasingFunction, easeInOutCubic } from './Easing';

export type AnimationPhase = 'idle' | 'zoom-out' | 'pan' | 'zoom-in';

export interface AnimationState {
    isAnimating: boolean;
    phase: AnimationPhase;
    progress: number;
}

export interface TourAnimator {
    animateTo: (
        from: ArbitraryCoordinate,
        to: TourStop,
        onFrame: (coord: ArbitraryCoordinate) => void,
        onComplete: () => void
    ) => void;
    cancel: () => void;
    getState: () => AnimationState;
}

interface AnimationConfig {
    zoomOutDuration: number;
    panDuration: number;
    zoomInDuration: number;
    minTransitZoom: number;
    easing: EasingFunction;
}

const DEFAULT_CONFIG: AnimationConfig = {
    zoomOutDuration: 1000,
    panDuration: 1500,
    zoomInDuration: 1500,
    minTransitZoom: 100,
    easing: easeInOutCubic
};

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

function logLerp(a: number, b: number, t: number): number {
    const logA = Math.log(a);
    const logB = Math.log(b);
    return Math.exp(lerp(logA, logB, t));
}

export function createTourAnimator(config: Partial<AnimationConfig> = {}): TourAnimator {
    const cfg = { ...DEFAULT_CONFIG, ...config };

    let animationFrameId: number | null = null;
    let state: AnimationState = { isAnimating: false, phase: 'idle', progress: 0 };

    const cancel = () => {
        if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        state = { isAnimating: false, phase: 'idle', progress: 0 };
    };

    const animateTo = (
        from: ArbitraryCoordinate,
        to: TourStop,
        onFrame: (coord: ArbitraryCoordinate) => void,
        onComplete: () => void
    ) => {
        cancel();

        const fromReal = from.real.toNumber();
        const fromImag = from.imag.toNumber();
        const fromZoom = from.zoom.toNumber();

        const toReal = parseFloat(to.real);
        const toImag = parseFloat(to.imag);
        const toZoom = to.zoom;

        // Calculate transit zoom - lower than both endpoints for the "Google Earth" effect
        const transitZoom = Math.min(
            cfg.minTransitZoom,
            fromZoom * 0.3,
            toZoom * 0.3
        );

        const totalDuration = cfg.zoomOutDuration + cfg.panDuration + cfg.zoomInDuration;
        const startTime = performance.now();

        const animate = (now: DOMHighResTimeStamp) => {
            const elapsed = now - startTime;

            if (elapsed >= totalDuration) {
                // Animation complete - set exact final position
                const finalCoord = createArbitraryCoordinate(to.real, to.imag, toZoom);
                onFrame(finalCoord);
                state = { isAnimating: false, phase: 'idle', progress: 0 };
                onComplete();
                return;
            }

            let currentReal: number;
            let currentImag: number;
            let currentZoom: number;

            if (elapsed < cfg.zoomOutDuration) {
                // Phase 1: Zoom out from start position
                const t = cfg.easing(elapsed / cfg.zoomOutDuration);
                state = { isAnimating: true, phase: 'zoom-out', progress: t };

                currentReal = fromReal;
                currentImag = fromImag;
                currentZoom = logLerp(fromZoom, transitZoom, t);

            } else if (elapsed < cfg.zoomOutDuration + cfg.panDuration) {
                // Phase 2: Pan at transit zoom level
                const panElapsed = elapsed - cfg.zoomOutDuration;
                const t = cfg.easing(panElapsed / cfg.panDuration);
                state = { isAnimating: true, phase: 'pan', progress: t };

                currentReal = lerp(fromReal, toReal, t);
                currentImag = lerp(fromImag, toImag, t);
                currentZoom = transitZoom;

            } else {
                // Phase 3: Zoom in to destination
                const zoomInElapsed = elapsed - cfg.zoomOutDuration - cfg.panDuration;
                const t = cfg.easing(zoomInElapsed / cfg.zoomInDuration);
                state = { isAnimating: true, phase: 'zoom-in', progress: t };

                currentReal = toReal;
                currentImag = toImag;
                currentZoom = logLerp(transitZoom, toZoom, t);
            }

            const currentCoord = createArbitraryCoordinate(
                currentReal.toString(),
                currentImag.toString(),
                currentZoom
            );

            onFrame(currentCoord);
            animationFrameId = requestAnimationFrame(animate);
        };

        state = { isAnimating: true, phase: 'zoom-out', progress: 0 };
        animationFrameId = requestAnimationFrame(animate);
    };

    return {
        animateTo,
        cancel,
        getState: () => ({ ...state })
    };
}
