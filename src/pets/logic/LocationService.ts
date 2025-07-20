import { calculateDistanceAndDirection, DistanceAndDirection } from "./Navigation";

export interface LocationService {
    calculateDistanceAndDirectionTo: (location: Location) => DistanceAndDirection | null;
}

export interface Location {
    lat: number;
    lon: number;
}

export function createLocationService(): LocationService {
    let currentLocation: Location | null = null;

    navigator.geolocation.watchPosition(position => {
        console.log(position);

        currentLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        };
    });

    return {
        calculateDistanceAndDirectionTo: (location) => {
            if (currentLocation === null) return null;

            return calculateDistanceAndDirection(currentLocation, location);
        }
    };
}
