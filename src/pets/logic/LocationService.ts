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

    const updateCurrentLocation = (position: GeolocationPosition) => {
        console.log(position);

        currentLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        };
    };

    navigator.geolocation.getCurrentPosition(updateCurrentLocation);
    navigator.geolocation.watchPosition(updateCurrentLocation);

    return {
        calculateDistanceAndDirectionTo: (location) => {
            if (currentLocation === null) return null;

            return calculateDistanceAndDirection(currentLocation, location);
        }
    };
}
