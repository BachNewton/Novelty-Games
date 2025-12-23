import { createNoiseGenerator } from './Noise';

export interface TerrainGenerator {
    getElevation: (worldX: number, worldY: number) => number;
    getMoisture: (worldX: number, worldY: number) => number;
    getTemperature: (worldX: number, worldY: number) => number;
}

// Scale constants for different terrain features
const CONTINENT_SCALE = 0.002;    // Large-scale landmasses
const MOUNTAIN_SCALE = 0.015;     // Mountain ranges
const DETAIL_SCALE = 0.08;        // Fine terrain detail
const MOISTURE_SCALE = 0.01;      // Moisture variation
const TEMP_SCALE = 0.005;         // Temperature variation

export function createTerrainGenerator(seed: number): TerrainGenerator {
    const elevationNoise = createNoiseGenerator(seed);
    const mountainNoise = createNoiseGenerator(seed + 1000);
    const detailNoise = createNoiseGenerator(seed + 2000);
    const moistureNoise = createNoiseGenerator(seed + 3000);
    const temperatureNoise = createNoiseGenerator(seed + 4000);

    return {
        getElevation: (worldX, worldY) => {
            // Continent-scale variation (determines land vs ocean)
            const continent = elevationNoise.octaveNoise2D(
                worldX * CONTINENT_SCALE,
                worldY * CONTINENT_SCALE,
                4, 0.5, 2.0
            );

            // Mountain ranges using ridged noise
            const mountains = mountainNoise.ridgedNoise2D(
                worldX * MOUNTAIN_SCALE,
                worldY * MOUNTAIN_SCALE,
                4, 0.5, 2.0
            );

            // Local detail
            const detail = detailNoise.octaveNoise2D(
                worldX * DETAIL_SCALE,
                worldY * DETAIL_SCALE,
                3, 0.5, 2.0
            ) * 0.15;

            // Blend: continent determines base, mountains add height on land
            const landMask = smoothstep(-0.1, 0.2, continent);
            const baseElevation = continent * 0.4;
            const mountainContribution = mountains * 0.5 * landMask;

            return baseElevation + mountainContribution + detail;
        },

        getMoisture: (worldX, worldY) => {
            // Base moisture from noise
            const noise = moistureNoise.octaveNoise2D(
                worldX * MOISTURE_SCALE,
                worldY * MOISTURE_SCALE,
                4, 0.5, 2.0
            );

            // Convert from [-1, 1] to [0, 1]
            return noise * 0.5 + 0.5;
        },

        getTemperature: (worldX, worldY) => {
            // Base temperature varies with "latitude" (Y position)
            // Creates bands of climate zones
            const latitudeEffect = Math.cos(worldY * 0.003) * 0.4 + 0.5;

            // Add noise variation
            const noiseEffect = temperatureNoise.octaveNoise2D(
                worldX * TEMP_SCALE,
                worldY * TEMP_SCALE,
                3, 0.5, 2.0
            ) * 0.2;

            return Math.max(0, Math.min(1, latitudeEffect + noiseEffect));
        }
    };
}

// Smooth interpolation function
function smoothstep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}
