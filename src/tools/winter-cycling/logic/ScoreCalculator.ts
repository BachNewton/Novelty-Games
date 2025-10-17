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

export function calculateMultiplier(temperature: number, temperatureUnit: TemperatureUnit): number {
    if (temperatureUnit === TemperatureUnit.FAHRENHEIT) {
        temperature = toCelsius(temperature);
    }

    const maxTemp = 10;   // °C
    const minTemp = -10;  // °C
    const maxMultiplier = 4.0;
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
