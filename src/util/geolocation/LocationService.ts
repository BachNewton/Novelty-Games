export interface LocationService {
    getLocation: () => Promise<Location>;
    watchLocation: (onLocationUpdate: (location: Location) => void) => void;
    stopWatching: () => void;
}

export interface Location {
    lat: number;
    lon: number;
}

export function createLocationService(): LocationService {
    let watchId: number | null = null;

    return {
        getLocation: () => new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(position => {
                resolve(toLocation(position));
            }, error => {
                reject(error);
            }, {
                enableHighAccuracy: true
            });
        }),
        watchLocation: (onLocationUpdate) => {
            watchId = navigator.geolocation.watchPosition(position => {
                onLocationUpdate(toLocation(position));
            }, _ => {
                // Ignore errors
            }, {
                enableHighAccuracy: true
            });
        },
        stopWatching: () => {
            if (watchId === null) return;
            navigator.geolocation.clearWatch(watchId);
        }
    }
};

function toLocation(position: GeolocationPosition): Location {
    return {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    };
}
