import { Location } from "../../../util/geolocation/LocationService";
import { PET_DATA } from "../data/PetData";
import { MapProjection, WorldPoint } from "./MapProjection";

/** The area covered by the vendored tiles. */
export const MAP_BOUNDS = {
    minLat: 60.130,
    maxLat: 60.212,
    minLon: 24.850,
    maxLon: 24.985
};

export const MIN_ZOOM = 11;
export const MAX_ZOOM = 15;

/** Radius of the fuzzy "somewhere around here" circle drawn for pets that haven't been found yet. */
export const HIDDEN_RADIUS_METERS = 500;

// Required by the tiles' licenses — see public/pets-map-tiles/ATTRIBUTION.md
export const MAP_ATTRIBUTION = 'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under CC BY SA.';

// Everything below is private to this module.
const TILE_DIRECTORY = 'pets-map-tiles';
const TILE_EXTENSION = 'jpg';
const TILE_MARGIN = 1;
const HIDDEN_OFFSET_MIN_RATIO = 0.15;
const HIDDEN_OFFSET_MAX_RATIO = 0.85;
const OVERLAP_OFFSET_PIXELS = 38;
const FIT_TOLERANCE = 1.2;
const LOCATION_KEY_PRECISION = 5;

export interface TileRange {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

export interface Tile {
    key: string;
    zoom: number;
    x: number;
    y: number;
}

export interface WorldRect {
    min: WorldPoint;
    max: WorldPoint;
}

/**
 * The single place that knows where tiles live. Swapping the folder or the file extension
 * only needs to happen here.
 */
export function buildTileUrl(zoom: number, x: number, y: number): string {
    return `${import.meta.env.BASE_URL}${TILE_DIRECTORY}/${zoom}/${x}/${y}.${TILE_EXTENSION}`;
}

export function getBoundsWorldRect(projection: MapProjection, zoom: number): WorldRect {
    const northWest = projection.locationToWorld({ lat: MAP_BOUNDS.maxLat, lon: MAP_BOUNDS.minLon }, zoom);
    const southEast = projection.locationToWorld({ lat: MAP_BOUNDS.minLat, lon: MAP_BOUNDS.maxLon }, zoom);

    return { min: northWest, max: southEast };
}

/** The world pixel that every tile and marker is positioned relative to, so their layout never shifts while panning. */
export function getLayerOrigin(projection: MapProjection, zoom: number): WorldPoint {
    return getBoundsWorldRect(projection, zoom).min;
}

export function getBoundsCenter(): Location {
    return {
        lat: (MAP_BOUNDS.minLat + MAP_BOUNDS.maxLat) / 2,
        lon: (MAP_BOUNDS.minLon + MAP_BOUNDS.maxLon) / 2
    };
}

/**
 * The largest zoom at which the whole play area still (near enough) fits on screen.
 *
 * A little overflow is allowed: the play area is 393x480 pixels at zoom 12, which just misses
 * a 390 pixel wide phone. Dropping all the way to zoom 11 for those 3 pixels would leave the
 * whole city as a tiny blob, so a small pan is preferred over a much emptier map.
 */
export function getFitZoom(projection: MapProjection, width: number, height: number): number {
    for (let zoom = MAX_ZOOM; zoom >= MIN_ZOOM; zoom--) {
        const rect = getBoundsWorldRect(projection, zoom);
        const fitsWidth = rect.max.x - rect.min.x <= width * FIT_TOLERANCE;
        const fitsHeight = rect.max.y - rect.min.y <= height * FIT_TOLERANCE;

        if (fitsWidth && fitsHeight) return zoom;
    }

    return MIN_ZOOM;
}

/**
 * The furthest out the player is allowed to zoom.
 *
 * Once the whole play area is on screen there is nothing left to reveal, so zooming out again
 * only shrinks the city into an island floating in empty background. MIN_ZOOM is the hard floor
 * underneath that, since no tiles exist below it.
 */
export function getMinZoom(projection: MapProjection, width: number, height: number): number {
    return Math.max(getFitZoom(projection, width, height), MIN_ZOOM);
}

/** Holds a zoom inside the levels that are both tiled and worth showing. */
export function clampZoom(zoom: number, minZoom: number = MIN_ZOOM): number {
    return Math.min(Math.max(zoom, Math.max(minZoom, MIN_ZOOM)), MAX_ZOOM);
}

/** Keeps the viewport inside the tiled area, centering the area on any axis that's smaller than the viewport. */
export function clampCenter(
    projection: MapProjection,
    center: Location,
    zoom: number,
    width: number,
    height: number
): Location {
    const rect = getBoundsWorldRect(projection, zoom);
    const world = projection.locationToWorld(center, zoom);

    return projection.worldToLocation({
        x: clampAxis(world.x, rect.min.x, rect.max.x, width),
        y: clampAxis(world.y, rect.min.y, rect.max.y, height)
    }, zoom);
}

export function getVisibleTileRange(
    projection: MapProjection,
    zoom: number,
    topLeft: WorldPoint,
    width: number,
    height: number
): TileRange {
    const first = projection.worldToTile(topLeft);
    const last = projection.worldToTile({ x: topLeft.x + width, y: topLeft.y + height });
    const bounds = getBoundsTileRange(projection, zoom);

    return {
        minX: Math.max(first.x - TILE_MARGIN, bounds.minX),
        maxX: Math.min(last.x + TILE_MARGIN, bounds.maxX),
        minY: Math.max(first.y - TILE_MARGIN, bounds.minY),
        maxY: Math.min(last.y + TILE_MARGIN, bounds.maxY)
    };
}

export function getBoundsTileRange(projection: MapProjection, zoom: number): TileRange {
    const rect = getBoundsWorldRect(projection, zoom);
    const first = projection.worldToTile(rect.min);
    const last = projection.worldToTile(rect.max);

    return { minX: first.x, maxX: last.x, minY: first.y, maxY: last.y };
}

export function getTiles(range: TileRange, zoom: number): Tile[] {
    const tiles: Tile[] = [];

    for (let x = range.minX; x <= range.maxX; x++) {
        for (let y = range.minY; y <= range.maxY; y++) {
            tiles.push({ key: `${zoom}/${x}/${y}`, zoom: zoom, x: x, y: y });
        }
    }

    return tiles;
}

/**
 * Where the fuzzy circle for an undiscovered pet is drawn.
 *
 * The circle is deliberately NOT centered on the pet: a hash of the pet's id picks a stable
 * bearing and a distance of 15% to 85% of the radius, so the center is always meaningfully
 * wrong while the pet still sits comfortably inside the circle. The lower bound matters as
 * much as the upper - a small offset would leave the center pointing almost straight at the
 * pet's real spot.
 */
export function getHiddenCenter(projection: MapProjection, petId: string, location: Location): Location {
    const cached = hiddenCenters.get(petId);
    if (cached !== undefined) return cached;

    const hash = hashString(petId);
    const bearing = (hash % 3600) / 10;
    const fraction = ((hash >>> 12) % 1000) / 1000;
    const ratio = HIDDEN_OFFSET_MIN_RATIO + fraction * (HIDDEN_OFFSET_MAX_RATIO - HIDDEN_OFFSET_MIN_RATIO);
    const center = projection.offsetLocation(location, ratio * HIDDEN_RADIUS_METERS, bearing);

    hiddenCenters.set(petId, center);

    return center;
}

/** Pets sharing a location (Luca and Nika) get nudged apart so both stay visible and tappable. */
export function getOverlapOffset(petId: string): WorldPoint {
    return overlapOffsets.get(petId) ?? { x: 0, y: 0 };
}

const hiddenCenters = new Map<string, Location>();
const overlapOffsets = createOverlapOffsets();

function createOverlapOffsets(): Map<string, WorldPoint> {
    const groups = new Map<string, string[]>();

    for (const pet of PET_DATA) {
        const key = locationKey(pet.location);
        const group = groups.get(key) ?? [];

        group.push(pet.id);
        groups.set(key, group);
    }

    const offsets = new Map<string, WorldPoint>();

    for (const [, group] of groups) {
        group.forEach((petId, index) => {
            if (group.length === 1) {
                offsets.set(petId, { x: 0, y: 0 });
                return;
            }

            const angle = (index / group.length) * 2 * Math.PI - Math.PI / 2;

            offsets.set(petId, {
                x: Math.cos(angle) * OVERLAP_OFFSET_PIXELS,
                y: Math.sin(angle) * OVERLAP_OFFSET_PIXELS
            });
        });
    }

    return offsets;
}

function locationKey(location: Location): string {
    return `${location.lat.toFixed(LOCATION_KEY_PRECISION)},${location.lon.toFixed(LOCATION_KEY_PRECISION)}`;
}

/** FNV-1a, chosen because it's tiny and gives the same answer in every session. */
function hashString(value: string): number {
    let hash = 2166136261;

    for (let index = 0; index < value.length; index++) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
}

function clampAxis(value: number, min: number, max: number, viewportSize: number): number {
    const half = viewportSize / 2;

    if (max - min <= viewportSize) return (min + max) / 2;

    return Math.min(Math.max(value, min + half), max - half);
}
