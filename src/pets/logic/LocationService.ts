export interface LocationService { }

export function createLocationService(): LocationService {
    navigator.geolocation.getCurrentPosition(position => {
        console.log(position);
    });

    return {};
}
