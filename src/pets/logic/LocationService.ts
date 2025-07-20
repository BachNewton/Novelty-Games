import { calculateDistanceAndDirection, DistanceAndDirection } from "./Navigation";

export interface LocationService {
    calculateDistanceAndDirectionTo: (location: Location) => Promise<DistanceAndDirection | null>;
}

export interface Location {
    lat: number;
    lon: number;
}

export function createLocationService(): LocationService {
    return {
        calculateDistanceAndDirectionTo: (location) => new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(position => {
                const currentLocation: Location = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };

                const distanceAndDirection = calculateDistanceAndDirection(currentLocation, location);

                resolve(distanceAndDirection);
            }, error => {
                reject(error);
            });
        })
    }
};
