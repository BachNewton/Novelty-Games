export enum Rider {
    KYLE, NICK, LANDON
}

export enum DistanceUnit {
    KM, MILE
}

export enum TemperatureUnit {
    CELSIUS, FAHRENHEIT
}

export interface Save {
    rider: Rider;
    distanceUnit: DistanceUnit;
    temperatureUnit: TemperatureUnit;
    distance: number;
    temperature: number;
}

export function createDefaultSave(): Save {
    return {
        rider: Rider.KYLE,
        distanceUnit: DistanceUnit.KM,
        temperatureUnit: TemperatureUnit.CELSIUS,
        distance: 5,
        temperature: 10
    };
}
