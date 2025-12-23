export type EasingFunction = (t: number) => number;

export const linear: EasingFunction = (t) => t;

export const easeInQuad: EasingFunction = (t) => t * t;

export const easeOutQuad: EasingFunction = (t) => 1 - (1 - t) * (1 - t);

export const easeInOutQuad: EasingFunction = (t) => {
    return t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

export const easeInCubic: EasingFunction = (t) => t * t * t;

export const easeOutCubic: EasingFunction = (t) => 1 - Math.pow(1 - t, 3);

export const easeInOutCubic: EasingFunction = (t) => {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const easeOutExpo: EasingFunction = (t) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export const easeInOutExpo: EasingFunction = (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return t < 0.5
        ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2;
};
