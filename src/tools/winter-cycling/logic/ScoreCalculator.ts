export function calculateScore(distance: number, temperature: number): number {
    const score = distance * calculateMultiplier(temperature);

    return Math.max(0, Math.round(score));
}

export function calculateMultiplier(temperature: number): number {
    // Define the scale based on the described mapping
    // Linear interpolation between 10C (1.0x) and -10C (4.0x)
    const maxTemp = 12;   // °C
    const minTemp = -12;  // °C
    const maxMultiplier = 8.0;
    const minMultiplier = 1.0;

    let multiplier: number;

    if (temperature >= maxTemp) {
        multiplier = minMultiplier; // 1.0x at 10C and above
    } else if (temperature <= minTemp) {
        multiplier = maxMultiplier; // 4.0x at -10C and below
    } else {
        // Linear interpolation between 10C → 1.0x and -10C → 4.0x
        const ratio = (maxTemp - temperature) / (maxTemp - minTemp); // from 0 → 1
        multiplier = minMultiplier + ratio * (maxMultiplier - minMultiplier);
    }

    return multiplier;
}
