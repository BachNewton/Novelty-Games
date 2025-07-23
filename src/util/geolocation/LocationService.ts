export interface LocationService {
    getLocation: () => Promise<Location>;
}

export interface Location {
    lat: number;
    lon: number;
}

export function createLocationService(): LocationService {
    return {
        getLocation: () => new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(position => {
                const location: Location = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };

                resolve(location);
            }, error => {
                reject(error);
            }, {
                enableHighAccuracy: true
            });
        })
    }
};
