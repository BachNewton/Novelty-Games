import {
    Chunk,
    ChunkCoordinate,
    Tile,
    City,
    Label,
    Street,
    Building,
    CHUNK_SIZE,
    BiomeType,
    RoadType,
    LabelType,
    RegionStyle
} from '../data/ChunkTypes';
import { createTerrainGenerator, TerrainGenerator } from './TerrainGenerator';
import { classifyBiome, isCitySuitable } from './BiomeClassifier';
import { createSeededRandom, hashCoordinate } from './SeededRandom';
import { createNameGenerator, NameGenerator } from './NameGenerator';

export interface WorldGenerator {
    generateChunk: (coord: ChunkCoordinate) => Chunk;
    getSeed: () => number;
    sampleBiome: (worldX: number, worldY: number) => BiomeType;
}

export function createWorldGenerator(seed: number): WorldGenerator {
    const terrain = createTerrainGenerator(seed);
    const nameGen = createNameGenerator(seed);

    return {
        generateChunk: (coord) => generateChunk(coord, seed, terrain, nameGen),
        getSeed: () => seed,
        sampleBiome: (worldX, worldY) => {
            const elevation = terrain.getElevation(worldX, worldY);
            const moisture = terrain.getMoisture(worldX, worldY);
            const temperature = terrain.getTemperature(worldX, worldY);
            return classifyBiome(elevation, moisture, temperature);
        }
    };
}

function generateChunk(
    coord: ChunkCoordinate,
    seed: number,
    terrain: TerrainGenerator,
    nameGen: NameGenerator
): Chunk {
    const chunkSeed = hashCoordinate(coord.chunkX, coord.chunkY, seed);
    const rng = createSeededRandom(chunkSeed);

    // Generate tiles
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

    // Generate rivers
    generateRivers(tiles, coord, seed, terrain);

    // Generate cities
    const cities = generateCities(tiles, coord, seed, rng, terrain, nameGen);

    // Generate roads between nearby cities
    generateRoads(tiles, cities, coord, seed, terrain);

    // Generate labels
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

function generateRivers(
    tiles: Tile[][],
    coord: ChunkCoordinate,
    seed: number,
    terrain: TerrainGenerator
): void {
    const riverSeed = hashCoordinate(coord.chunkX, coord.chunkY, seed + 5000);
    const rng = createSeededRandom(riverSeed);

    // Chance to have a river source in this chunk
    if (rng.next() > 0.15) return;

    // Find high elevation points
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

    // Trace river downhill
    let x = highestX;
    let y = highestY;
    let iterations = 0;
    const maxIterations = CHUNK_SIZE * 2;

    while (iterations < maxIterations) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_SIZE) break;

        const tile = tiles[y][x];
        if (tile.biome === BiomeType.OCEAN ||
            tile.biome === BiomeType.DEEP_OCEAN ||
            tile.biome === BiomeType.COASTAL_WATER) {
            break;
        }

        tile.riverStrength = Math.min(1, tile.riverStrength + 0.3 + iterations * 0.02);
        if (tile.biome !== BiomeType.RIVER && tile.riverStrength > 0.5) {
            tile.biome = BiomeType.RIVER;
        }

        // Find lowest neighbor
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

        // If no lower neighbor, break
        if (nextX === x && nextY === y) break;

        x = nextX;
        y = nextY;
        iterations++;
    }
}

function generateCities(
    tiles: Tile[][],
    coord: ChunkCoordinate,
    seed: number,
    rng: ReturnType<typeof createSeededRandom>,
    terrain: TerrainGenerator,
    nameGen: NameGenerator
): City[] {
    const cities: City[] = [];

    // Only try to place a city with some probability
    if (rng.next() > 0.08) return cities;

    // Find best location in chunk
    let bestScore = 0;
    let bestX = CHUNK_SIZE / 2;
    let bestY = CHUNK_SIZE / 2;

    for (let y = 8; y < CHUNK_SIZE - 8; y += 8) {
        for (let x = 8; x < CHUNK_SIZE - 8; x += 8) {
            const tile = tiles[y][x];
            if (!isCitySuitable(tile.biome)) continue;

            // Score based on flatness, water proximity, etc.
            let score = 1;

            // Prefer flatter terrain
            score += (1 - Math.abs(tile.elevation - 0.1)) * 2;

            // Prefer moderate moisture
            score += (1 - Math.abs(tile.moisture - 0.5)) * 1.5;

            // Check for nearby water (bonus)
            for (let dy = -5; dy <= 5; dy++) {
                for (let dx = -5; dx <= 5; dx++) {
                    const ny = y + dy;
                    const nx = x + dx;
                    if (ny >= 0 && ny < CHUNK_SIZE && nx >= 0 && nx < CHUNK_SIZE) {
                        const nearTile = tiles[ny][nx];
                        if (nearTile.biome === BiomeType.RIVER ||
                            nearTile.biome === BiomeType.COASTAL_WATER) {
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

    // Generate streets and buildings for the city
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

    // Mark city tiles
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

function generateRoads(
    tiles: Tile[][],
    cities: City[],
    coord: ChunkCoordinate,
    seed: number,
    terrain: TerrainGenerator
): void {
    const chunkWorldX = coord.chunkX * CHUNK_SIZE;
    const chunkWorldY = coord.chunkY * CHUNK_SIZE;

    // Generate global highway network (deterministic grid with some variation)
    // Highways run at intervals of ~100 world units
    const HIGHWAY_SPACING = 80;

    // Find highway lines that pass through or near this chunk
    const nearestHwyX = Math.round(chunkWorldX / HIGHWAY_SPACING) * HIGHWAY_SPACING;
    const nearestHwyY = Math.round(chunkWorldY / HIGHWAY_SPACING) * HIGHWAY_SPACING;

    // Draw highways through chunk
    for (let hwyOffset = -HIGHWAY_SPACING; hwyOffset <= HIGHWAY_SPACING + CHUNK_SIZE; hwyOffset += HIGHWAY_SPACING) {
        // Vertical highway
        const hwyX = nearestHwyX + hwyOffset - chunkWorldX;
        if (hwyX >= -5 && hwyX < CHUNK_SIZE + 5) {
            traceHighway(tiles, Math.floor(hwyX), 'vertical', coord, seed, terrain);
        }

        // Horizontal highway
        const hwyY = nearestHwyY + hwyOffset - chunkWorldY;
        if (hwyY >= -5 && hwyY < CHUNK_SIZE + 5) {
            traceHighway(tiles, Math.floor(hwyY), 'horizontal', coord, seed, terrain);
        }
    }

    // Connect cities to nearest highway using A*-like pathfinding
    for (const city of cities) {
        const localX = Math.floor(city.centerX - chunkWorldX);
        const localY = Math.floor(city.centerY - chunkWorldY);

        // Find nearest highway point
        const nearestHwyLocalX = Math.round((city.centerX) / HIGHWAY_SPACING) * HIGHWAY_SPACING - chunkWorldX;
        const nearestHwyLocalY = Math.round((city.centerY) / HIGHWAY_SPACING) * HIGHWAY_SPACING - chunkWorldY;

        // Path to vertical highway
        if (nearestHwyLocalX >= 0 && nearestHwyLocalX < CHUNK_SIZE) {
            pathfindRoad(tiles, localX, localY, Math.floor(nearestHwyLocalX), localY, terrain, coord, RoadType.PAVED);
        }

        // Path to horizontal highway
        if (nearestHwyLocalY >= 0 && nearestHwyLocalY < CHUNK_SIZE) {
            pathfindRoad(tiles, localX, localY, localX, Math.floor(nearestHwyLocalY), terrain, coord, RoadType.PAVED);
        }

        // Add rail line from larger cities to highway
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

function traceHighway(
    tiles: Tile[][],
    position: number,
    direction: 'horizontal' | 'vertical',
    coord: ChunkCoordinate,
    _seed: number,
    terrain: TerrainGenerator
): void {
    const chunkWorldX = coord.chunkX * CHUNK_SIZE;
    const chunkWorldY = coord.chunkY * CHUNK_SIZE;

    // Highways follow terrain, avoiding water and mountains
    let offset = 0;
    const maxOffset = 15;

    for (let i = 0; i < CHUNK_SIZE; i++) {
        // Try to find a passable position
        let bestOffset = offset;
        let bestElevation = -999;

        // Search for best offset
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

            // Skip water and high mountains
            if (elevation < -0.05 || elevation > 0.45) continue;

            // Prefer staying close to original position and flat terrain
            const score = -Math.abs(tryOffset) * 0.1 - Math.abs(elevation - 0.1);
            if (score > bestElevation) {
                bestElevation = score;
                bestOffset = tryOffset;
            }
        }

        // Only place road if we found valid terrain
        if (bestElevation > -999) {
            offset = bestOffset; // Smooth transition

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
    tiles: Tile[][],
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    terrain: TerrainGenerator,
    coord: ChunkCoordinate,
    roadType: RoadType
): void {
    // Simple A*-like pathfinding
    const chunkWorldX = coord.chunkX * CHUNK_SIZE;
    const chunkWorldY = coord.chunkY * CHUNK_SIZE;

    interface Node {
        x: number;
        y: number;
        g: number;
        h: number;
        f: number;
        parent: Node | null;
    }

    const openSet: Node[] = [];
    const closedSet = new Set<string>();

    const startNode: Node = {
        x: startX,
        y: startY,
        g: 0,
        h: Math.abs(endX - startX) + Math.abs(endY - startY),
        f: Math.abs(endX - startX) + Math.abs(endY - startY),
        parent: null
    };
    openSet.push(startNode);

    const maxIterations = 500;
    let iterations = 0;

    while (openSet.length > 0 && iterations < maxIterations) {
        iterations++;

        // Find node with lowest f score
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift()!;

        if (current.x === endX && current.y === endY) {
            // Reconstruct path
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

        // Check neighbors
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

            // Calculate movement cost based on terrain
            const worldX = chunkWorldX + nx;
            const worldY = chunkWorldY + ny;
            const elevation = terrain.getElevation(worldX, worldY);

            // Water and high mountains are impassable
            if (tile.biome === BiomeType.OCEAN ||
                tile.biome === BiomeType.DEEP_OCEAN ||
                tile.biome === BiomeType.COASTAL_WATER ||
                tile.biome === BiomeType.LAKE ||
                elevation < -0.05 ||
                elevation > 0.45) {
                continue; // Skip this neighbor entirely
            }

            let cost = 1;
            // Mountains are expensive
            if (elevation > 0.35) {
                cost = 8;
            }
            // Hills are somewhat expensive
            else if (elevation > 0.25) {
                cost = 3;
            }
            // Rivers can be crossed but cost more
            else if (tile.biome === BiomeType.RIVER) {
                cost = 4;
            }

            const g = current.g + cost;
            const h = Math.abs(endX - nx) + Math.abs(endY - ny);
            const f = g + h;

            // Check if already in open set with better score
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

    // If pathfinding failed, don't draw a road through impassable terrain
}

function generateLabels(
    tiles: Tile[][],
    cities: City[],
    coord: ChunkCoordinate,
    seed: number,
    nameGen: NameGenerator
): Label[] {
    const labels: Label[] = [];

    // City labels
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

    // Region/biome labels (sparse)
    const labelRng = createSeededRandom(hashCoordinate(coord.chunkX, coord.chunkY, seed + 9000));

    if (labelRng.next() < 0.1) {
        // Find dominant biome
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

        // Only label interesting biomes
        if (dominantBiome === BiomeType.FOREST ||
            dominantBiome === BiomeType.MOUNTAINS ||
            dominantBiome === BiomeType.DESERT ||
            dominantBiome === BiomeType.JUNGLE ||
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

function determineRegionStyle(worldX: number, worldY: number, seed: number): RegionStyle {
    // Use noise to create distinct cultural regions
    const regionNoise = hashCoordinate(
        Math.floor(worldX / 500),
        Math.floor(worldY / 500),
        seed + 8000
    );

    const styles = [
        RegionStyle.NORDIC,
        RegionStyle.CELTIC,
        RegionStyle.LATIN,
        RegionStyle.DESERT,
        RegionStyle.EASTERN,
        RegionStyle.FANTASY
    ];

    return styles[regionNoise % styles.length];
}

function generateCityStreets(
    centerX: number,
    centerY: number,
    radius: number,
    rng: ReturnType<typeof createSeededRandom>
): Street[] {
    const streets: Street[] = [];
    const isRadial = rng.next() < 0.4;

    if (isRadial) {
        // Radial street pattern - streets emanate from center
        const numRadials = 4 + Math.floor(rng.next() * 4);
        for (let i = 0; i < numRadials; i++) {
            const angle = (i / numRadials) * Math.PI * 2 + rng.next() * 0.2;
            streets.push({
                type: 'main',
                points: [
                    { worldX: centerX, worldY: centerY },
                    {
                        worldX: centerX + Math.cos(angle) * radius * 0.95,
                        worldY: centerY + Math.sin(angle) * radius * 0.95
                    }
                ]
            });
        }

        // Ring roads
        const numRings = Math.floor(radius / 4);
        for (let r = 1; r <= numRings; r++) {
            const ringRadius = (r / numRings) * radius * 0.8;
            const segments = 16;
            const points: { worldX: number; worldY: number }[] = [];
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                points.push({
                    worldX: centerX + Math.cos(angle) * ringRadius,
                    worldY: centerY + Math.sin(angle) * ringRadius
                });
            }
            streets.push({ type: 'secondary', points });
        }
    } else {
        // Grid street pattern
        const gridSpacing = 1.5 + rng.next() * 1;
        const gridAngle = rng.next() * Math.PI / 6;
        const cosA = Math.cos(gridAngle);
        const sinA = Math.sin(gridAngle);

        // Horizontal-ish streets
        for (let offset = -radius; offset <= radius; offset += gridSpacing) {
            const startX = centerX + offset * cosA - radius * sinA;
            const startY = centerY + offset * sinA + radius * cosA;
            const endX = centerX + offset * cosA + radius * sinA;
            const endY = centerY + offset * sinA - radius * cosA;

            // Clip to city radius
            const points = clipLineToCircle(startX, startY, endX, endY, centerX, centerY, radius * 0.9);
            if (points) {
                streets.push({
                    type: Math.abs(offset) < gridSpacing ? 'main' : 'secondary',
                    points
                });
            }
        }

        // Vertical-ish streets
        for (let offset = -radius; offset <= radius; offset += gridSpacing) {
            const startX = centerX + offset * sinA + radius * cosA;
            const startY = centerY - offset * cosA + radius * sinA;
            const endX = centerX + offset * sinA - radius * cosA;
            const endY = centerY - offset * cosA - radius * sinA;

            const points = clipLineToCircle(startX, startY, endX, endY, centerX, centerY, radius * 0.9);
            if (points) {
                streets.push({
                    type: Math.abs(offset) < gridSpacing ? 'main' : 'secondary',
                    points
                });
            }
        }
    }

    return streets;
}

function clipLineToCircle(
    x1: number, y1: number,
    x2: number, y2: number,
    cx: number, cy: number,
    r: number
): { worldX: number; worldY: number }[] | null {
    // Simple clip - just check if endpoints are in circle and clamp
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.1) return null;

    const points: { worldX: number; worldY: number }[] = [];

    // Find intersections with circle
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

    points.push({
        worldX: x1 + dx * clampedT1,
        worldY: y1 + dy * clampedT1
    });
    points.push({
        worldX: x1 + dx * clampedT2,
        worldY: y1 + dy * clampedT2
    });

    return points;
}

function generateCityBuildings(
    centerX: number,
    centerY: number,
    radius: number,
    streets: Street[],
    rng: ReturnType<typeof createSeededRandom>
): Building[] {
    const buildings: Building[] = [];
    const buildingDensity = 0.3 + rng.next() * 0.3;
    const gridStep = 0.4;

    // Generate buildings on a grid, avoiding streets
    for (let dy = -radius; dy < radius; dy += gridStep) {
        for (let dx = -radius; dx < radius; dx += gridStep) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > radius * 0.85) continue;

            // Random chance to place building
            if (rng.next() > buildingDensity) continue;

            const bx = centerX + dx + (rng.next() - 0.5) * 0.2;
            const by = centerY + dy + (rng.next() - 0.5) * 0.2;

            // Check if too close to a street
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

            // Create building footprint
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

function pointToLineDistance(
    px: number, py: number,
    x1: number, y1: number,
    x2: number, y2: number
): number {
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
