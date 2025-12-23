// Chunk and tile configuration
export const CHUNK_SIZE = 64;  // 64x64 tiles per chunk
export const TILE_WORLD_SIZE = 1;  // 1 world unit per tile

// Biome types
export enum BiomeType {
    DEEP_OCEAN,
    OCEAN,
    COASTAL_WATER,
    BEACH,
    PLAINS,
    FOREST,
    JUNGLE,
    DESERT,
    HILLS,
    MOUNTAINS,
    SNOW_PEAKS,
    TUNDRA,
    SWAMP,
    LAKE,
    RIVER
}

// Road types
export enum RoadType {
    NONE,
    DIRT,
    PAVED,
    RAIL
}

// Label types
export enum LabelType {
    CITY,
    TOWN,
    VILLAGE,
    REGION,
    MOUNTAIN,
    MOUNTAIN_RANGE,
    LAKE,
    RIVER,
    SEA,
    OCEAN,
    FOREST,
    DESERT
}

// Region naming styles
export enum RegionStyle {
    NORDIC,
    CELTIC,
    LATIN,
    DESERT,
    EASTERN,
    FANTASY
}

// Coordinate interfaces
export interface WorldCoordinate {
    worldX: number;
    worldY: number;
}

export interface ChunkCoordinate {
    chunkX: number;
    chunkY: number;
}

export interface TileCoordinate {
    tileX: number;
    tileY: number;
}

// Tile data
export interface Tile {
    elevation: number;      // -1 (deep ocean) to 1 (mountain peak)
    moisture: number;       // 0 (dry) to 1 (wet)
    temperature: number;    // 0 (cold) to 1 (hot)
    biome: BiomeType;
    riverStrength: number;  // 0 = no river, >0 = river width factor
    roadType: RoadType;
    cityId?: string;
}

// Street segment
export interface Street {
    type: 'main' | 'secondary' | 'alley';
    points: WorldCoordinate[];
}

// Building footprint
export interface Building {
    id: string;
    footprint: WorldCoordinate[];  // Polygon vertices
    height: number;
}

// City data
export interface City {
    id: string;
    name: string;
    centerX: number;
    centerY: number;
    radius: number;
    population: number;
    regionStyle: RegionStyle;
    streets: Street[];
    buildings: Building[];
}

// Road segment between cities
export interface RoadSegment {
    type: RoadType;
    path: WorldCoordinate[];
    fromCityId: string;
    toCityId: string;
}

// Map label
export interface Label {
    id: string;
    text: string;
    worldX: number;
    worldY: number;
    type: LabelType;
    minZoom: number;
    maxZoom: number;
    fontSize: number;
    rotation?: number;
}

// Chunk data
export interface Chunk {
    coord: ChunkCoordinate;
    tiles: Tile[][];  // [y][x] - row major
    cities: City[];
    roadSegments: RoadSegment[];
    labels: Label[];
    generatedAt: number;
}

// Utility functions
export function getChunkKey(coord: ChunkCoordinate): string {
    return `${coord.chunkX},${coord.chunkY}`;
}

export function worldToChunk(worldX: number, worldY: number): ChunkCoordinate {
    return {
        chunkX: Math.floor(worldX / CHUNK_SIZE),
        chunkY: Math.floor(worldY / CHUNK_SIZE)
    };
}

export function worldToTileInChunk(worldX: number, worldY: number): TileCoordinate {
    const chunkX = Math.floor(worldX / CHUNK_SIZE);
    const chunkY = Math.floor(worldY / CHUNK_SIZE);
    return {
        tileX: Math.floor(worldX - chunkX * CHUNK_SIZE),
        tileY: Math.floor(worldY - chunkY * CHUNK_SIZE)
    };
}

export function chunkToWorld(coord: ChunkCoordinate): WorldCoordinate {
    return {
        worldX: coord.chunkX * CHUNK_SIZE,
        worldY: coord.chunkY * CHUNK_SIZE
    };
}
