export function calculateScore(distance: number, temperature: number): number {
    const score = calculateBase(distance) * calculateMultiplier(temperature);

    return Math.max(0, Math.round(score));
}

export function calculateBase(distance: number): number {
    return distance * 10;
}

export function calculateMultiplier(temperature: number): number {
    const maxTemp = 12;   // °C
    const minTemp = -12;  // °C
    const maxMultiplier = 8.0;
    const minMultiplier = 1.0;

    let multiplier: number;

    if (temperature >= maxTemp) {
        multiplier = minMultiplier;
    } else if (temperature <= minTemp) {
        multiplier = maxMultiplier;
    } else {
        const ratio = (maxTemp - temperature) / (maxTemp - minTemp); // from 0 → 1
        multiplier = minMultiplier + ratio * (maxMultiplier - minMultiplier);
    }

    return multiplier;
}
