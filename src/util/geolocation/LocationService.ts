export interface LocationService {
    getLocation: () => Promise<Location>;
    watchLocation: () => void;
    stopWatching: () => void;
    setLocationListener: (locationListener: (location: Location) => void) => void;
}

export interface Location {
    lat: number;
    lon: number;
}

export function createLocationService(): LocationService {
    let locationListener: ((location: Location) => void) | null = null;
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
        watchLocation: () => {
            watchId = navigator.geolocation.watchPosition(position => {
                locationListener?.(toLocation(position));
            }, _ => {
                // Ignore errors
            }, {
                enableHighAccuracy: true
            });
        },
        stopWatching: () => {
            if (watchId === null) return;
            navigator.geolocation.clearWatch(watchId);
        },
        setLocationListener: listener => locationListener = listener
    }
};

function toLocation(position: GeolocationPosition): Location {
    return {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    };
}
