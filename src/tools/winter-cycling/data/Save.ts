export enum Rider {
    KYLE, NICK, LANDON
}

export enum DistanceUnit {
    KM, MILE
}

export enum TemperatureUnit {
    CELSIUS, FAHRENHEIT
}

export enum ServerEnv {
    DEVELOPMENT, PRODUCTION
}

export interface Save {
    rider: Rider;
    distanceUnit: DistanceUnit;
    temperatureUnit: TemperatureUnit;
    distance: number;
    temperature: number;
    serverEnv?: ServerEnv;
    monthIndex?: number | null;
    leaderboardIndex?: number | null;
}

export function createDefaultSave(): Save {
    return {
        rider: Rider.NICK,
        distanceUnit: DistanceUnit.MILE,
        temperatureUnit: TemperatureUnit.FAHRENHEIT,
        distance: 0,
        temperature: 45,
        serverEnv: ServerEnv.DEVELOPMENT,
        monthIndex: null,
        leaderboardIndex: null
    };
}
