// Web Worker for chunk generation
// This file is self-contained with all dependencies inlined

declare const self: DedicatedWorkerGlobalScope;

// ============= Types (from ChunkTypes.ts) =============
const CHUNK_SIZE = 64;

enum BiomeType {
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

enum RoadType {
    NONE,
    DIRT,
    PAVED,
    RAIL
}

enum LabelType {
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

enum RegionStyle {
    NORDIC,
    CELTIC,
    LATIN,
    DESERT,
    EASTERN,
    FANTASY
}

interface Tile {
    elevation: number;
    moisture: number;
    temperature: number;
    biome: BiomeType;
    riverStrength: number;
    roadType: RoadType;
    cityId?: string;
}

interface WorldCoordinate {
    worldX: number;
    worldY: number;
}

interface ChunkCoordinate {
    chunkX: number;
    chunkY: number;
}

interface Street {
    type: 'main' | 'secondary' | 'alley';
    points: WorldCoordinate[];
}

interface Building {
    id: string;
    footprint: WorldCoordinate[];
    height: number;
}

interface City {
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

interface RoadSegment {
    type: RoadType;
    path: WorldCoordinate[];
    fromCityId: string;
    toCityId: string;
}

interface Label {
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

interface Chunk {
    coord: ChunkCoordinate;
    tiles: Tile[][];
    cities: City[];
    roadSegments: RoadSegment[];
    labels: Label[];
    generatedAt: number;
}

// ============= SeededRandom =============
interface SeededRandom {
    next: () => number;
    nextInt: (max: number) => number;
    nextRange: (min: number, max: number) => number;
    nextBool: (probability?: number) => boolean;
    shuffle: <T>(array: T[]) => T[];
    pick: <T>(array: T[]) => T;
}

function createSeededRandom(seed: number): SeededRandom {
    let state = seed >>> 0;

    function next(): number {
        state |= 0;
        state = (state + 0x6D2B79F5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    return {
        next,
        nextInt: (max) => Math.floor(next() * max),
        nextRange: (min, max) => min + next() * (max - min),
        nextBool: (probability = 0.5) => next() < probability,
        shuffle: <T>(array: T[]): T[] => {
            const result = [...array];
            for (let i = result.length - 1; i > 0; i--) {
                const j = Math.floor(next() * (i + 1));
                [result[i], result[j]] = [result[j], result[i]];
            }
            return result;
        },
        pick: <T>(array: T[]): T => array[Math.floor(next() * array.length)]
    };
}

function hashCoordinate(x: number, y: number, seed: number): number {
    let hash = seed;
    hash = Math.imul(hash ^ (x | 0), 0x85ebca6b);
    hash = Math.imul(hash ^ (y | 0), 0xc2b2ae35);
    hash ^= hash >>> 16;
    return hash >>> 0;
}

// ============= Noise =============
const GRAD3: [number, number][] = [
    [1, 1], [-1, 1], [1, -1], [-1, -1],
    [1, 0], [-1, 0], [0, 1], [0, -1]
];

const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

interface NoiseGenerator {
    noise2D: (x: number, y: number) => number;
    octaveNoise2D: (x: number, y: number, octaves: number, persistence: number, lacunarity: number) => number;
    ridgedNoise2D: (x: number, y: number, octaves: number, persistence: number, lacunarity: number) => number;
}

function createNoiseGenerator(seed: number): NoiseGenerator {
    const rng = createSeededRandom(seed);
    const perm: number[] = [];
    const permMod8: number[] = [];

    for (let i = 0; i < 256; i++) {
        perm[i] = i;
    }

    for (let i = 255; i > 0; i--) {
        const j = rng.nextInt(i + 1);
        [perm[i], perm[j]] = [perm[j], perm[i]];
    }

    for (let i = 0; i < 512; i++) {
        perm[i] = perm[i & 255];
        permMod8[i] = perm[i] & 7;
    }

    function dot2(gx: number, gy: number, x: number, y: number): number {
        return gx * x + gy * y;
    }

    function noise2D(x: number, y: number): number {
        const s = (x + y) * F2;
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);

        const t = (i + j) * G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = x - X0;
        const y0 = y - Y0;

        let i1: number, j1: number;
        if (x0 > y0) {
            i1 = 1;
            j1 = 0;
        } else {
            i1 = 0;
            j1 = 1;
        }

        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1 + 2 * G2;
        const y2 = y0 - 1 + 2 * G2;

        const ii = i & 255;
        const jj = j & 255;

        let n0 = 0, n1 = 0, n2 = 0;

        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) {
            t0 *= t0;
            const gi0 = permMod8[ii + perm[jj]];
            const [gx0, gy0] = GRAD3[gi0];
            n0 = t0 * t0 * dot2(gx0, gy0, x0, y0);
        }

        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) {
            t1 *= t1;
            const gi1 = permMod8[ii + i1 + perm[jj + j1]];
            const [gx1, gy1] = GRAD3[gi1];
            n1 = t1 * t1 * dot2(gx1, gy1, x1, y1);
        }

        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) {
            t2 *= t2;
            const gi2 = permMod8[ii + 1 + perm[jj + 1]];
            const [gx2, gy2] = GRAD3[gi2];
            n2 = t2 * t2 * dot2(gx2, gy2, x2, y2);
        }

        return 70 * (n0 + n1 + n2);
    }

    function octaveNoise2D(x: number, y: number, octaves: number, persistence: number, lacunarity: number): number {
        let total = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += noise2D(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }

        return total / maxValue;
    }

    function ridgedNoise2D(x: number, y: number, octaves: number, persistence: number, lacunarity: number): number {
        let total = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            const n = 1 - Math.abs(noise2D(x * frequency, y * frequency));
            total += n * n * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }

        return total / maxValue;
    }

    return { noise2D, octaveNoise2D, ridgedNoise2D };
}

// ============= TerrainGenerator =============
const CONTINENT_SCALE = 0.002;
const MOUNTAIN_SCALE = 0.015;
const DETAIL_SCALE = 0.08;
const MOISTURE_SCALE = 0.01;
const TEMP_SCALE = 0.005;

interface TerrainGenerator {
    getElevation: (worldX: number, worldY: number) => number;
    getMoisture: (worldX: number, worldY: number) => number;
    getTemperature: (worldX: number, worldY: number) => number;
}

function createTerrainGenerator(seed: number): TerrainGenerator {
    const elevationNoise = createNoiseGenerator(seed);
    const mountainNoise = createNoiseGenerator(seed + 1000);
    const detailNoise = createNoiseGenerator(seed + 2000);
    const moistureNoise = createNoiseGenerator(seed + 3000);
    const temperatureNoise = createNoiseGenerator(seed + 4000);

    function smoothstep(edge0: number, edge1: number, x: number): number {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    }

    return {
        getElevation: (worldX, worldY) => {
            const continent = elevationNoise.octaveNoise2D(
                worldX * CONTINENT_SCALE, worldY * CONTINENT_SCALE, 4, 0.5, 2.0
            );
            const mountains = mountainNoise.ridgedNoise2D(
                worldX * MOUNTAIN_SCALE, worldY * MOUNTAIN_SCALE, 4, 0.5, 2.0
            );
            const detail = detailNoise.octaveNoise2D(
                worldX * DETAIL_SCALE, worldY * DETAIL_SCALE, 3, 0.5, 2.0
            ) * 0.15;

            const landMask = smoothstep(-0.1, 0.2, continent);
            const baseElevation = continent * 0.4;
            const mountainContribution = mountains * 0.5 * landMask;

            return baseElevation + mountainContribution + detail;
        },

        getMoisture: (worldX, worldY) => {
            const noise = moistureNoise.octaveNoise2D(
                worldX * MOISTURE_SCALE, worldY * MOISTURE_SCALE, 4, 0.5, 2.0
            );
            return noise * 0.5 + 0.5;
        },

        getTemperature: (worldX, worldY) => {
            const latitudeEffect = Math.cos(worldY * 0.003) * 0.4 + 0.5;
            const noiseEffect = temperatureNoise.octaveNoise2D(
                worldX * TEMP_SCALE, worldY * TEMP_SCALE, 3, 0.5, 2.0
            ) * 0.2;
            return Math.max(0, Math.min(1, latitudeEffect + noiseEffect));
        }
    };
}

// ============= BiomeClassifier =============
function classifyBiome(elevation: number, moisture: number, temperature: number): BiomeType {
    if (elevation < -0.3) return BiomeType.DEEP_OCEAN;
    if (elevation < -0.15) return BiomeType.OCEAN;
    if (elevation < -0.05) return BiomeType.COASTAL_WATER;
    if (elevation < 0.02) return BiomeType.BEACH;

    if (elevation > 0.55) return BiomeType.SNOW_PEAKS;
    if (elevation > 0.4) return BiomeType.MOUNTAINS;
    if (elevation > 0.25) return BiomeType.HILLS;

    if (temperature < 0.25) return BiomeType.TUNDRA;

    if (moisture < 0.25) return BiomeType.DESERT;

    if (moisture < 0.4) {
        if (temperature > 0.6) return BiomeType.DESERT;
        return BiomeType.PLAINS;
    }

    if (moisture > 0.7) {
        if (temperature > 0.65) return BiomeType.JUNGLE;
        if (temperature < 0.35) return BiomeType.SWAMP;
        return BiomeType.FOREST;
    }

    if (moisture > 0.5) {
        if (temperature > 0.6) return BiomeType.JUNGLE;
        return BiomeType.FOREST;
    }

    return BiomeType.PLAINS;
}

function isCitySuitable(biome: BiomeType): boolean {
    return biome === BiomeType.PLAINS ||
           biome === BiomeType.FOREST ||
           biome === BiomeType.HILLS ||
           biome === BiomeType.BEACH;
}

// ============= NameGenerator =============
interface NameParts {
    prefixes: string[];
    roots: string[];
    suffixes: string[];
}

const NAME_PARTS: Record<RegionStyle, NameParts> = {
    [RegionStyle.NORDIC]: {
        prefixes: ['Thor', 'Frost', 'Iron', 'Storm', 'Wolf', 'Raven', 'Snow', 'Ice', 'Stone', 'Bear'],
        roots: ['heim', 'gard', 'fjord', 'vik', 'dal', 'berg', 'holm', 'vang', 'fell', 'mark'],
        suffixes: ['en', '', 'stad', 'by', 'ness']
    },
    [RegionStyle.CELTIC]: {
        prefixes: ['Dun', 'Glen', 'Bally', 'Kin', 'Strath', 'Aber', 'Kil', 'Loch', 'Ben', 'Cairn'],
        roots: ['more', 'derry', 'bridge', 'ford', 'wick', 'ton', 'wood', 'field', 'vale', 'moor'],
        suffixes: ['', 'ey', 'ie', 'ach', 'an']
    },
    [RegionStyle.LATIN]: {
        prefixes: ['Port', 'Villa', 'Monte', 'Bella', 'Alta', 'Nova', 'Santa', 'San', 'Rio', 'Terra'],
        roots: ['vista', 'mare', 'rosa', 'verde', 'luna', 'sol', 'oro', 'plata', 'cruz', 'piedra'],
        suffixes: ['', 'ia', 'um', 'ino', 'ero']
    },
    [RegionStyle.DESERT]: {
        prefixes: ['Al', 'El', 'Kas', 'Dar', 'Bab', 'Wadi', 'Oum', 'Ain', 'Jebel', 'Ras'],
        roots: ['rashid', 'salem', 'qadir', 'malik', 'hamid', 'kareem', 'zahir', 'nadir', 'farid', 'jamil'],
        suffixes: ['', 'a', 'i', 'abad', 'stan']
    },
    [RegionStyle.EASTERN]: {
        prefixes: ['Jade', 'Golden', 'Silver', 'Dragon', 'Phoenix', 'Moon', 'Sun', 'Cloud', 'Misty', 'Crane'],
        roots: ['peak', 'river', 'gate', 'bridge', 'garden', 'temple', 'spring', 'lake', 'forest', 'mountain'],
        suffixes: ['', ' Valley', ' Heights', ' Crossing', '']
    },
    [RegionStyle.FANTASY]: {
        prefixes: ['Shadow', 'Crystal', 'Silver', 'Ember', 'Thorn', 'Mist', 'Star', 'Dawn', 'Dusk', 'Rune'],
        roots: ['mere', 'vale', 'spire', 'haven', 'hold', 'gate', 'wood', 'glade', 'keep', 'reach'],
        suffixes: ['', 'shire', 'land', 'fell', 'dale']
    }
};

const BIOME_WORDS: Record<BiomeType, string[]> = {
    [BiomeType.DEEP_OCEAN]: ['Abyss', 'Depths', 'Deep'],
    [BiomeType.OCEAN]: ['Sea', 'Waters', 'Ocean'],
    [BiomeType.COASTAL_WATER]: ['Bay', 'Gulf', 'Strait'],
    [BiomeType.BEACH]: ['Shore', 'Coast', 'Strand'],
    [BiomeType.PLAINS]: ['Plains', 'Grasslands', 'Steppes', 'Prairie'],
    [BiomeType.FOREST]: ['Forest', 'Woods', 'Woodland', 'Grove'],
    [BiomeType.JUNGLE]: ['Jungle', 'Rainforest', 'Wilds'],
    [BiomeType.DESERT]: ['Desert', 'Wastes', 'Sands', 'Dunes'],
    [BiomeType.HILLS]: ['Hills', 'Highlands', 'Downs'],
    [BiomeType.MOUNTAINS]: ['Mountains', 'Peaks', 'Range', 'Heights'],
    [BiomeType.SNOW_PEAKS]: ['Frostpeaks', 'Snowcaps', 'Icepeaks'],
    [BiomeType.TUNDRA]: ['Tundra', 'Wastes', 'Barrens', 'Expanse'],
    [BiomeType.SWAMP]: ['Swamp', 'Marsh', 'Bog', 'Mire'],
    [BiomeType.LAKE]: ['Lake', 'Loch', 'Mere'],
    [BiomeType.RIVER]: ['River', 'Stream', 'Waters']
};

interface NameGenerator {
    generateCityName: (style: RegionStyle, worldX: number, worldY: number) => string;
    generateRegionName: (style: RegionStyle, biome: BiomeType, worldX: number, worldY: number) => string;
}

function createNameGenerator(seed: number): NameGenerator {
    return {
        generateCityName: (style, worldX, worldY) => {
            const locationSeed = hashCoordinate(Math.floor(worldX), Math.floor(worldY), seed + 7919);
            const rng = createSeededRandom(locationSeed);
            const parts = NAME_PARTS[style];

            const usePrefix = rng.next() < 0.7;
            const useSuffix = rng.next() < 0.5;

            let name = '';
            if (usePrefix) name += rng.pick(parts.prefixes);
            name += rng.pick(parts.roots);
            if (useSuffix) name += rng.pick(parts.suffixes);

            return name.charAt(0).toUpperCase() + name.slice(1);
        },

        generateRegionName: (style, biome, worldX, worldY) => {
            const locationSeed = hashCoordinate(Math.floor(worldX), Math.floor(worldY), seed + 8923);
            const rng = createSeededRandom(locationSeed);
            const parts = NAME_PARTS[style];
            const biomeWords = BIOME_WORDS[biome] || ['Lands'];

            const patterns = [
                () => `The ${rng.pick(parts.prefixes)} ${rng.pick(biomeWords)}`,
                () => `${rng.pick(parts.prefixes)}${rng.pick(parts.roots)} ${rng.pick(biomeWords)}`,
                () => `${rng.pick(biomeWords)} of ${rng.pick(parts.prefixes)}${rng.pick(parts.roots)}`
            ];

            return rng.pick(patterns)();
        }
    };
}

// ============= WorldGenerator (chunk generation) =============
function determineRegionStyle(worldX: number, worldY: number, seed: number): RegionStyle {
    const regionNoise = hashCoordinate(Math.floor(worldX / 500), Math.floor(worldY / 500), seed + 8000);
    const styles = [
        RegionStyle.NORDIC, RegionStyle.CELTIC, RegionStyle.LATIN,
        RegionStyle.DESERT, RegionStyle.EASTERN, RegionStyle.FANTASY
    ];
    return styles[regionNoise % styles.length];
}

function generateRivers(tiles: Tile[][], coord: ChunkCoordinate, seed: number, terrain: TerrainGenerator): void {
    const riverSeed = hashCoordinate(coord.chunkX, coord.chunkY, seed + 5000);
    const rng = createSeededRandom(riverSeed);

    if (rng.next() > 0.15) return;

    let highestElevation = -1;
    let highestX = 0;
    let highestY = 0;

    for (let y = 0; y < CHUNK_SIZE; y++) {
        for (let x = 0; x < CHUNK_SIZE; x++) {
            const tile = tiles[y][x];
            if (tile.elevation > 0.3 && tile.elevation > highestElevation) {
                highestElevation = tile.elevation;
                highestX = x;
                highestY = y;
            }
        }
    }

    if (highestElevation < 0.3) return;

    let x = highestX;
    let y = highestY;
    let iterations = 0;
    const maxIterations = CHUNK_SIZE * 2;

    while (iterations < maxIterations) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_SIZE) break;

        const tile = tiles[y][x];
        if (tile.biome === BiomeType.OCEAN || tile.biome === BiomeType.DEEP_OCEAN || tile.biome === BiomeType.COASTAL_WATER) {
            break;
        }

        tile.riverStrength = Math.min(1, tile.riverStrength + 0.3 + iterations * 0.02);
        if (tile.biome !== BiomeType.RIVER && tile.riverStrength > 0.5) {
            tile.biome = BiomeType.RIVER;
        }

        let lowestElevation = tile.elevation;
        let nextX = x;
        let nextY = y;

        const neighbors = [
            [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
            [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1], [x + 1, y + 1]
        ];

        for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < CHUNK_SIZE && ny >= 0 && ny < CHUNK_SIZE) {
                const neighborTile = tiles[ny][nx];
                if (neighborTile.elevation < lowestElevation) {
                    lowestElevation = neighborTile.elevation;
                    nextX = nx;
                    nextY = ny;
                }
            }
        }

        if (nextX === x && nextY === y) break;

        x = nextX;
        y = nextY;
        iterations++;
    }
}

function clipLineToCircle(
    x1: number, y1: number, x2: number, y2: number,
    cx: number, cy: number, r: number
): { worldX: number; worldY: number }[] | null {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.1) return null;

    const fx = x1 - cx;
    const fy = y1 - cy;
    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - r * r;
    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) return null;

    const sqrtD = Math.sqrt(discriminant);
    const t1 = (-b - sqrtD) / (2 * a);
    const t2 = (-b + sqrtD) / (2 * a);

    if (t2 < 0 || t1 > 1) return null;

    const clampedT1 = Math.max(0, t1);
    const clampedT2 = Math.min(1, t2);

    return [
        { worldX: x1 + dx * clampedT1, worldY: y1 + dy * clampedT1 },
        { worldX: x1 + dx * clampedT2, worldY: y1 + dy * clampedT2 }
    ];
}

function generateCityStreets(centerX: number, centerY: number, radius: number, rng: SeededRandom): Street[] {
    const streets: Street[] = [];
    const isRadial = rng.next() < 0.4;

    if (isRadial) {
        const numRadials = 4 + Math.floor(rng.next() * 4);
        for (let i = 0; i < numRadials; i++) {
            const angle = (i / numRadials) * Math.PI * 2 + rng.next() * 0.2;
            streets.push({
                type: 'main',
                points: [
                    { worldX: centerX, worldY: centerY },
                    { worldX: centerX + Math.cos(angle) * radius * 0.95, worldY: centerY + Math.sin(angle) * radius * 0.95 }
                ]
            });
        }

        const numRings = Math.floor(radius / 4);
        for (let r = 1; r <= numRings; r++) {
            const ringRadius = (r / numRings) * radius * 0.8;
            const segments = 16;
            const points: { worldX: number; worldY: number }[] = [];
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                points.push({ worldX: centerX + Math.cos(angle) * ringRadius, worldY: centerY + Math.sin(angle) * ringRadius });
            }
            streets.push({ type: 'secondary', points });
        }
    } else {
        const gridSpacing = 1.5 + rng.next() * 1;
        const gridAngle = rng.next() * Math.PI / 6;
        const cosA = Math.cos(gridAngle);
        const sinA = Math.sin(gridAngle);

        for (let offset = -radius; offset <= radius; offset += gridSpacing) {
            const startX = centerX + offset * cosA - radius * sinA;
            const startY = centerY + offset * sinA + radius * cosA;
            const endX = centerX + offset * cosA + radius * sinA;
            const endY = centerY + offset * sinA - radius * cosA;

            const points = clipLineToCircle(startX, startY, endX, endY, centerX, centerY, radius * 0.9);
            if (points) {
                streets.push({ type: Math.abs(offset) < gridSpacing ? 'main' : 'secondary', points });
            }
        }

        for (let offset = -radius; offset <= radius; offset += gridSpacing) {
            const startX = centerX + offset * sinA + radius * cosA;
            const startY = centerY - offset * cosA + radius * sinA;
            const endX = centerX + offset * sinA - radius * cosA;
            const endY = centerY - offset * cosA - radius * sinA;

            const points = clipLineToCircle(startX, startY, endX, endY, centerX, centerY, radius * 0.9);
            if (points) {
                streets.push({ type: Math.abs(offset) < gridSpacing ? 'main' : 'secondary', points });
            }
        }
    }

    return streets;
}

function pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len2 = dx * dx + dy * dy;

    if (len2 < 0.0001) {
        return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    }

    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
    const nearX = x1 + t * dx;
    const nearY = y1 + t * dy;

    return Math.sqrt((px - nearX) ** 2 + (py - nearY) ** 2);
}

function generateCityBuildings(centerX: number, centerY: number, radius: number, streets: Street[], rng: SeededRandom): Building[] {
    const buildings: Building[] = [];
    const buildingDensity = 0.3 + rng.next() * 0.3;
    const gridStep = 0.4;

    for (let dy = -radius; dy < radius; dy += gridStep) {
        for (let dx = -radius; dx < radius; dx += gridStep) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > radius * 0.85) continue;

            if (rng.next() > buildingDensity) continue;

            const bx = centerX + dx + (rng.next() - 0.5) * 0.2;
            const by = centerY + dy + (rng.next() - 0.5) * 0.2;

            let tooCloseToStreet = false;
            for (const street of streets) {
                for (let i = 0; i < street.points.length - 1; i++) {
                    const p1 = street.points[i];
                    const p2 = street.points[i + 1];
                    const distToStreet = pointToLineDistance(bx, by, p1.worldX, p1.worldY, p2.worldX, p2.worldY);
                    if (distToStreet < 0.3) {
                        tooCloseToStreet = true;
                        break;
                    }
                }
                if (tooCloseToStreet) break;
            }

            if (tooCloseToStreet) continue;

            const width = 0.15 + rng.next() * 0.2;
            const height = 0.15 + rng.next() * 0.2;

            buildings.push({
                id: `building_${bx.toFixed(2)}_${by.toFixed(2)}`,
                footprint: [
                    { worldX: bx - width / 2, worldY: by - height / 2 },
                    { worldX: bx + width / 2, worldY: by - height / 2 },
                    { worldX: bx + width / 2, worldY: by + height / 2 },
                    { worldX: bx - width / 2, worldY: by + height / 2 }
                ],
                height: 1 + rng.next() * 3
            });
        }
    }

    return buildings;
}

function generateCities(
    tiles: Tile[][], coord: ChunkCoordinate, seed: number,
    rng: SeededRandom, terrain: TerrainGenerator, nameGen: NameGenerator
): City[] {
    const cities: City[] = [];

    if (rng.next() > 0.08) return cities;

    let bestScore = 0;
    let bestX = CHUNK_SIZE / 2;
    let bestY = CHUNK_SIZE / 2;

    for (let y = 8; y < CHUNK_SIZE - 8; y += 8) {
        for (let x = 8; x < CHUNK_SIZE - 8; x += 8) {
            const tile = tiles[y][x];
            if (!isCitySuitable(tile.biome)) continue;

            let score = 1;
            score += (1 - Math.abs(tile.elevation - 0.1)) * 2;
            score += (1 - Math.abs(tile.moisture - 0.5)) * 1.5;

            for (let dy = -5; dy <= 5; dy++) {
                for (let dx = -5; dx <= 5; dx++) {
                    const ny = y + dy;
                    const nx = x + dx;
                    if (ny >= 0 && ny < CHUNK_SIZE && nx >= 0 && nx < CHUNK_SIZE) {
                        const nearTile = tiles[ny][nx];
                        if (nearTile.biome === BiomeType.RIVER || nearTile.biome === BiomeType.COASTAL_WATER) {
                            score += 0.5;
                        }
                    }
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestX = x;
                bestY = y;
            }
        }
    }

    if (bestScore < 2) return cities;

    const worldX = coord.chunkX * CHUNK_SIZE + bestX;
    const worldY = coord.chunkY * CHUNK_SIZE + bestY;
    const regionStyle = determineRegionStyle(worldX, worldY, seed);
    const name = nameGen.generateCityName(regionStyle, worldX, worldY);
    const population = Math.floor(500 + rng.next() * 50000);
    const radius = 3 + Math.sqrt(population / 1000);

    const cityRng = createSeededRandom(hashCoordinate(worldX, worldY, seed + 6000));
    const streets = generateCityStreets(worldX, worldY, radius, cityRng);
    const buildings = generateCityBuildings(worldX, worldY, radius, streets, cityRng);

    const city: City = {
        id: `city_${worldX}_${worldY}`,
        name,
        centerX: worldX,
        centerY: worldY,
        radius,
        population,
        regionStyle,
        streets,
        buildings
    };

    cities.push(city);

    for (let dy = -Math.ceil(radius); dy <= Math.ceil(radius); dy++) {
        for (let dx = -Math.ceil(radius); dx <= Math.ceil(radius); dx++) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= radius) {
                const ty = bestY + dy;
                const tx = bestX + dx;
                if (ty >= 0 && ty < CHUNK_SIZE && tx >= 0 && tx < CHUNK_SIZE) {
                    tiles[ty][tx].cityId = city.id;
                }
            }
        }
    }

    return cities;
}

function traceHighway(
    tiles: Tile[][], position: number, direction: 'horizontal' | 'vertical',
    coord: ChunkCoordinate, _seed: number, terrain: TerrainGenerator
): void {
    const chunkWorldX = coord.chunkX * CHUNK_SIZE;
    const chunkWorldY = coord.chunkY * CHUNK_SIZE;

    let offset = 0;
    const maxOffset = 15;

    for (let i = 0; i < CHUNK_SIZE; i++) {
        let bestOffset = offset;
        let bestElevation = -999;

        for (let tryOffset = -maxOffset; tryOffset <= maxOffset; tryOffset++) {
            let x: number, y: number;
            let worldX: number, worldY: number;

            if (direction === 'vertical') {
                x = position + tryOffset;
                y = i;
            } else {
                x = i;
                y = position + tryOffset;
            }

            if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_SIZE) continue;

            worldX = chunkWorldX + x;
            worldY = chunkWorldY + y;

            const elevation = terrain.getElevation(worldX, worldY);
            if (elevation < -0.05 || elevation > 0.45) continue;

            const score = -Math.abs(tryOffset) * 0.1 - Math.abs(elevation - 0.1);
            if (score > bestElevation) {
                bestElevation = score;
                bestOffset = tryOffset;
            }
        }

        if (bestElevation > -999) {
            offset = bestOffset;

            let x: number, y: number;
            if (direction === 'vertical') {
                x = Math.max(0, Math.min(CHUNK_SIZE - 1, position + offset));
                y = i;
            } else {
                x = i;
                y = Math.max(0, Math.min(CHUNK_SIZE - 1, position + offset));
            }

            const tile = tiles[y]?.[x];
            if (tile && tile.roadType !== RoadType.RAIL) {
                tile.roadType = RoadType.PAVED;
            }
        }
    }
}

function pathfindRoad(
    tiles: Tile[][], startX: number, startY: number, endX: number, endY: number,
    terrain: TerrainGenerator, coord: ChunkCoordinate, roadType: RoadType
): void {
    const chunkWorldX = coord.chunkX * CHUNK_SIZE;
    const chunkWorldY = coord.chunkY * CHUNK_SIZE;

    interface Node {
        x: number; y: number; g: number; h: number; f: number; parent: Node | null;
    }

    const openSet: Node[] = [];
    const closedSet = new Set<string>();

    const startNode: Node = {
        x: startX, y: startY, g: 0,
        h: Math.abs(endX - startX) + Math.abs(endY - startY),
        f: Math.abs(endX - startX) + Math.abs(endY - startY),
        parent: null
    };
    openSet.push(startNode);

    const maxIterations = 500;
    let iterations = 0;

    while (openSet.length > 0 && iterations < maxIterations) {
        iterations++;

        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift()!;

        if (current.x === endX && current.y === endY) {
            let node: Node | null = current;
            while (node) {
                const tile = tiles[node.y]?.[node.x];
                if (tile && (tile.roadType === RoadType.NONE ||
                    (roadType === RoadType.RAIL && tile.roadType !== RoadType.RAIL))) {
                    tile.roadType = roadType;
                }
                node = node.parent;
            }
            return;
        }

        closedSet.add(`${current.x},${current.y}`);

        const neighbors = [
            { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
        ];

        for (const { dx, dy } of neighbors) {
            const nx = current.x + dx;
            const ny = current.y + dy;

            if (nx < 0 || nx >= CHUNK_SIZE || ny < 0 || ny >= CHUNK_SIZE) continue;
            if (closedSet.has(`${nx},${ny}`)) continue;

            const tile = tiles[ny]?.[nx];
            if (!tile) continue;

            const worldX = chunkWorldX + nx;
            const worldY = chunkWorldY + ny;
            const elevation = terrain.getElevation(worldX, worldY);

            if (tile.biome === BiomeType.OCEAN || tile.biome === BiomeType.DEEP_OCEAN ||
                tile.biome === BiomeType.COASTAL_WATER || tile.biome === BiomeType.LAKE ||
                elevation < -0.05 || elevation > 0.45) {
                continue;
            }

            let cost = 1;
            if (elevation > 0.35) cost = 8;
            else if (elevation > 0.25) cost = 3;
            else if (tile.biome === BiomeType.RIVER) cost = 4;

            const g = current.g + cost;
            const h = Math.abs(endX - nx) + Math.abs(endY - ny);
            const f = g + h;

            const existing = openSet.find(n => n.x === nx && n.y === ny);
            if (existing && existing.f <= f) continue;

            if (existing) {
                existing.g = g;
                existing.h = h;
                existing.f = f;
                existing.parent = current;
            } else {
                openSet.push({ x: nx, y: ny, g, h, f, parent: current });
            }
        }
    }
}

function generateRoads(tiles: Tile[][], cities: City[], coord: ChunkCoordinate, seed: number, terrain: TerrainGenerator): void {
    const chunkWorldX = coord.chunkX * CHUNK_SIZE;
    const chunkWorldY = coord.chunkY * CHUNK_SIZE;
    const HIGHWAY_SPACING = 80;

    const nearestHwyX = Math.round(chunkWorldX / HIGHWAY_SPACING) * HIGHWAY_SPACING;
    const nearestHwyY = Math.round(chunkWorldY / HIGHWAY_SPACING) * HIGHWAY_SPACING;

    for (let hwyOffset = -HIGHWAY_SPACING; hwyOffset <= HIGHWAY_SPACING + CHUNK_SIZE; hwyOffset += HIGHWAY_SPACING) {
        const hwyX = nearestHwyX + hwyOffset - chunkWorldX;
        if (hwyX >= -5 && hwyX < CHUNK_SIZE + 5) {
            traceHighway(tiles, Math.floor(hwyX), 'vertical', coord, seed, terrain);
        }

        const hwyY = nearestHwyY + hwyOffset - chunkWorldY;
        if (hwyY >= -5 && hwyY < CHUNK_SIZE + 5) {
            traceHighway(tiles, Math.floor(hwyY), 'horizontal', coord, seed, terrain);
        }
    }

    for (const city of cities) {
        const localX = Math.floor(city.centerX - chunkWorldX);
        const localY = Math.floor(city.centerY - chunkWorldY);

        const nearestHwyLocalX = Math.round((city.centerX) / HIGHWAY_SPACING) * HIGHWAY_SPACING - chunkWorldX;
        const nearestHwyLocalY = Math.round((city.centerY) / HIGHWAY_SPACING) * HIGHWAY_SPACING - chunkWorldY;

        if (nearestHwyLocalX >= 0 && nearestHwyLocalX < CHUNK_SIZE) {
            pathfindRoad(tiles, localX, localY, Math.floor(nearestHwyLocalX), localY, terrain, coord, RoadType.PAVED);
        }

        if (nearestHwyLocalY >= 0 && nearestHwyLocalY < CHUNK_SIZE) {
            pathfindRoad(tiles, localX, localY, localX, Math.floor(nearestHwyLocalY), terrain, coord, RoadType.PAVED);
        }

        if (city.population > 15000) {
            const railTarget = Math.abs(nearestHwyLocalX - localX) < Math.abs(nearestHwyLocalY - localY)
                ? { x: Math.floor(nearestHwyLocalX), y: localY }
                : { x: localX, y: Math.floor(nearestHwyLocalY) };

            if (railTarget.x >= 0 && railTarget.x < CHUNK_SIZE && railTarget.y >= 0 && railTarget.y < CHUNK_SIZE) {
                pathfindRoad(tiles, localX, localY, railTarget.x, railTarget.y, terrain, coord, RoadType.RAIL);
            }
        }
    }
}

function getLabelTypeForBiome(biome: BiomeType): LabelType {
    switch (biome) {
        case BiomeType.FOREST:
        case BiomeType.JUNGLE:
            return LabelType.FOREST;
        case BiomeType.MOUNTAINS:
        case BiomeType.SNOW_PEAKS:
            return LabelType.MOUNTAIN_RANGE;
        case BiomeType.DESERT:
            return LabelType.DESERT;
        default:
            return LabelType.REGION;
    }
}

function generateLabels(tiles: Tile[][], cities: City[], coord: ChunkCoordinate, seed: number, nameGen: NameGenerator): Label[] {
    const labels: Label[] = [];

    for (const city of cities) {
        labels.push({
            id: `label_${city.id}`,
            text: city.name,
            worldX: city.centerX,
            worldY: city.centerY + city.radius + 2,
            type: city.population > 10000 ? LabelType.CITY : LabelType.TOWN,
            minZoom: city.population > 10000 ? 0.5 : 2,
            maxZoom: 100,
            fontSize: city.population > 10000 ? 14 : 11
        });
    }

    const labelRng = createSeededRandom(hashCoordinate(coord.chunkX, coord.chunkY, seed + 9000));

    if (labelRng.next() < 0.1) {
        const biomeCounts = new Map<BiomeType, number>();
        for (let y = 0; y < CHUNK_SIZE; y++) {
            for (let x = 0; x < CHUNK_SIZE; x++) {
                const biome = tiles[y][x].biome;
                biomeCounts.set(biome, (biomeCounts.get(biome) || 0) + 1);
            }
        }

        let dominantBiome = BiomeType.PLAINS;
        let maxCount = 0;
        for (const [biome, count] of biomeCounts) {
            if (count > maxCount && biome !== BiomeType.OCEAN && biome !== BiomeType.DEEP_OCEAN) {
                maxCount = count;
                dominantBiome = biome;
            }
        }

        if (dominantBiome === BiomeType.FOREST || dominantBiome === BiomeType.MOUNTAINS ||
            dominantBiome === BiomeType.DESERT || dominantBiome === BiomeType.JUNGLE ||
            dominantBiome === BiomeType.TUNDRA) {

            const worldX = coord.chunkX * CHUNK_SIZE + CHUNK_SIZE / 2;
            const worldY = coord.chunkY * CHUNK_SIZE + CHUNK_SIZE / 2;
            const regionStyle = determineRegionStyle(worldX, worldY, seed);
            const name = nameGen.generateRegionName(regionStyle, dominantBiome, worldX, worldY);

            labels.push({
                id: `region_${coord.chunkX}_${coord.chunkY}`,
                text: name,
                worldX,
                worldY,
                type: getLabelTypeForBiome(dominantBiome),
                minZoom: 0.3,
                maxZoom: 5,
                fontSize: 16
            });
        }
    }

    return labels;
}

function generateChunk(coord: ChunkCoordinate, seed: number, terrain: TerrainGenerator, nameGen: NameGenerator): Chunk {
    const chunkSeed = hashCoordinate(coord.chunkX, coord.chunkY, seed);
    const rng = createSeededRandom(chunkSeed);

    const tiles: Tile[][] = [];
    for (let y = 0; y < CHUNK_SIZE; y++) {
        tiles[y] = [];
        for (let x = 0; x < CHUNK_SIZE; x++) {
            const worldX = coord.chunkX * CHUNK_SIZE + x;
            const worldY = coord.chunkY * CHUNK_SIZE + y;

            const elevation = terrain.getElevation(worldX, worldY);
            const moisture = terrain.getMoisture(worldX, worldY);
            const temperature = terrain.getTemperature(worldX, worldY);
            const biome = classifyBiome(elevation, moisture, temperature);

            tiles[y][x] = {
                elevation,
                moisture,
                temperature,
                biome,
                riverStrength: 0,
                roadType: RoadType.NONE
            };
        }
    }

    generateRivers(tiles, coord, seed, terrain);
    const cities = generateCities(tiles, coord, seed, rng, terrain, nameGen);
    generateRoads(tiles, cities, coord, seed, terrain);
    const labels = generateLabels(tiles, cities, coord, seed, nameGen);

    return {
        coord,
        tiles,
        cities,
        roadSegments: [],
        labels,
        generatedAt: Date.now()
    };
}

// ============= Worker Message Handler =============
interface GenerateMessage {
    type: 'generate';
    chunkX: number;
    chunkY: number;
    seed: number;
}

interface InitMessage {
    type: 'init';
    seed: number;
}

type WorkerMessage = GenerateMessage | InitMessage;

let currentSeed: number | null = null;
let terrain: TerrainGenerator | null = null;
let nameGen: NameGenerator | null = null;

function initGenerator(seed: number) {
    if (currentSeed !== seed) {
        currentSeed = seed;
        terrain = createTerrainGenerator(seed);
        nameGen = createNameGenerator(seed);
    }
}

/* eslint-disable no-restricted-globals */
self.onmessage = (e: MessageEvent<WorkerMessage>) => {
    const message = e.data;

    if (message.type === 'init') {
        initGenerator(message.seed);
        self.postMessage({ type: 'ready' });
        return;
    }

    if (message.type === 'generate') {
        initGenerator(message.seed);

        const chunk = generateChunk(
            { chunkX: message.chunkX, chunkY: message.chunkY },
            message.seed,
            terrain!,
            nameGen!
        );

        self.postMessage({
            type: 'chunk',
            chunkX: message.chunkX,
            chunkY: message.chunkY,
            chunk
        });
    }
};
/* eslint-enable no-restricted-globals */

export {};
