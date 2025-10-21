import { DistanceUnit, TemperatureUnit } from "../data/Save";
import { toCelsius, toKilometers } from "./Converter";

export const SCORE_FOR_MAX_INTENSITY = calculateScore(20, 0, DistanceUnit.KM, TemperatureUnit.CELSIUS);

export function calculateScore(distance: number, temperature: number, distanceUnit: DistanceUnit, temperatureUnit: TemperatureUnit): number {
    const score = calculateBase(distance, distanceUnit) * calculateMultiplier(temperature, temperatureUnit);

    return Math.max(0, Math.round(score));
}

export function calculateBase(distance: number, distanceUnit: DistanceUnit): number {
    if (distanceUnit === DistanceUnit.MILE) {
        distance = toKilometers(distance);
    }

    return distance * 10;
}

export function calculateMultiplier(
    temperature: number,
    temperatureUnit: TemperatureUnit
): number {
    if (temperatureUnit === TemperatureUnit.FAHRENHEIT) {
        temperature = toCelsius(temperature);
    }

    let multiplier: number;

    if (temperature >= 10) {
        multiplier = 1.0;
    } else if (temperature >= 0) {
        // Between 0°C and 10°C → +0.1 per degree below 10
        multiplier = 1.0 + (10 - temperature) * 0.1;
    } else {
        // Below 0°C → base 2.0 at 0°C, then +0.2 per degree below 0
        multiplier = 2.0 + (0 - temperature) * 0.2;
    }

    multiplier = Math.min(Math.max(multiplier, 1.0), 4.0);

    return multiplier;
}
