export function toCelsius(fahrenheit: number): number {
    return (fahrenheit - 32) * 5 / 9;
}

export function toKilometers(miles: number): number {
    return miles * 1.60934;
}
