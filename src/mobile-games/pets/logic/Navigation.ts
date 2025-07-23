import { getDirection } from "../../../util/geolocation/Compass";
import { toDegrees, toRadians } from "../../../util/Math";
import { Location } from "./LocationService";

const EARTH_RADIUS = 6371; // Radius of the Earth in kilometers

export interface DistanceAndDirection {
    distance: number;
    direction: string;
}

export function calculateDistanceAndDirection(location1: Location, location2: Location): DistanceAndDirection {
    const lat1 = location1.lat;
    const lon1 = location1.lon;
    const lat2 = location2.lat;
    const lon2 = location2.lon;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const radLat1 = toRadians(lat1);
    const radLat2 = toRadians(lat2);

    const distance = calculateDistance(dLat, radLat1, radLat2, dLon);
    const direction = calculateDirection(dLon, radLat2, radLat1);

    return {
        distance: distance,
        direction: direction
    };
}

function calculateDistance(dLat: number, radLat1: number, radLat2: number, dLon: number): number {
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(radLat1) * Math.cos(radLat2) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = EARTH_RADIUS * c;

    return distance;
}

function calculateDirection(dLon: number, radLat2: number, radLat1: number): string {
    const y = Math.sin(dLon) * Math.cos(radLat2);
    const x = Math.cos(radLat1) * Math.sin(radLat2) -
        Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(dLon);

    const bearing = (toDegrees(Math.atan2(y, x)) + 360) % 360;

    return getDirection(bearing);;
}
