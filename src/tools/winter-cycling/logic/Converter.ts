import { Rider } from "../data/Save";

export function toCelsius(fahrenheit: number): number {
    return (fahrenheit - 32) * 5 / 9;
}

export function toFahrenheit(celsius: number): number {
    return (celsius * 9 / 5) + 32;
}

export function toKilometers(miles: number): number {
    return miles * 1.60934;
}

export function toMiles(kilometers: number): number {
    return kilometers / 1.60934;
}

export function riderDisplayName(rider: Rider): string {
    switch (rider) {
        case Rider.KYLE:
            return "Kyle";
        case Rider.NICK:
            return "Nick";
        case Rider.LANDON:
            return "Landon";
    }
}
