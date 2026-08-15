import { Location } from "../../../util/geolocation/LocationService";

/**
 * Minimal Web Mercator ("slippy map") projection.
 *
 * World pixels: at a given integer zoom the whole world is a square of
 * TILE_SIZE * 2^zoom pixels, with (0, 0) at the north-west corner.
 */

export const TILE_SIZE = 256;

const EARTH_CIRCUMFERENCE_METERS = 40075016.686;
const METERS_PER_LATITUDE_DEGREE = 111320;
const MAX_MERCATOR_LATITUDE = 85.05112878;

export interface WorldPoint {
    x: number;
    y: number;
}

export interface MapProjection {
    /** Width (and height) of the whole world in pixels at the given zoom. */
    worldSize: (zoom: number) => number;

    locationToWorld: (location: Location, zoom: number) => WorldPoint;

    worldToLocation: (point: WorldPoint, zoom: number) => Location;

    /** Tile the given world pixel falls inside of. */
    worldToTile: (point: WorldPoint) => WorldPoint;

    metersPerPixel: (lat: number, zoom: number) => number;

    metersToPixels: (meters: number, lat: number, zoom: number) => number;

    /** Moves a location a number of meters along a compass bearing (0 = north, 90 = east). */
    offsetLocation: (location: Location, meters: number, bearingDegrees: number) => Location;
}

export function createMapProjection(tileSize: number = TILE_SIZE): MapProjection {
    return {
        worldSize: zoom => worldSize(tileSize, zoom),

        locationToWorld: (location, zoom) => locationToWorld(tileSize, location, zoom),

        worldToLocation: (point, zoom) => worldToLocation(tileSize, point, zoom),

        worldToTile: point => worldToTile(tileSize, point),

        metersPerPixel: (lat, zoom) => metersPerPixel(tileSize, lat, zoom),

        metersToPixels: (meters, lat, zoom) => meters / metersPerPixel(tileSize, lat, zoom),

        offsetLocation: offsetLocation
    };
}

function worldSize(tileSize: number, zoom: number): number {
    return tileSize * Math.pow(2, zoom);
}

function locationToWorld(tileSize: number, location: Location, zoom: number): WorldPoint {
    const size = worldSize(tileSize, zoom);
    const lat = clamp(location.lat, -MAX_MERCATOR_LATITUDE, MAX_MERCATOR_LATITUDE);
    const sinLat = Math.sin(toRadians(lat));

    return {
        x: ((location.lon + 180) / 360) * size,
        y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * size
    };
}

function worldToLocation(tileSize: number, point: WorldPoint, zoom: number): Location {
    const size = worldSize(tileSize, zoom);
    const n = Math.PI - (2 * Math.PI * point.y) / size;

    return {
        lat: toDegrees(Math.atan(Math.sinh(n))),
        lon: (point.x / size) * 360 - 180
    };
}

function worldToTile(tileSize: number, point: WorldPoint): WorldPoint {
    return {
        x: Math.floor(point.x / tileSize),
        y: Math.floor(point.y / tileSize)
    };
}

function metersPerPixel(tileSize: number, lat: number, zoom: number): number {
    return (EARTH_CIRCUMFERENCE_METERS * Math.cos(toRadians(lat))) / worldSize(tileSize, zoom);
}

function offsetLocation(location: Location, meters: number, bearingDegrees: number): Location {
    const bearing = toRadians(bearingDegrees);
    const north = meters * Math.cos(bearing);
    const east = meters * Math.sin(bearing);

    return {
        lat: location.lat + north / METERS_PER_LATITUDE_DEGREE,
        lon: location.lon + east / (METERS_PER_LATITUDE_DEGREE * Math.cos(toRadians(location.lat)))
    };
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
}
