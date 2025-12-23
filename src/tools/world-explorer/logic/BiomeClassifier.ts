import { BiomeType } from '../data/ChunkTypes';

// Classify biome based on terrain parameters using Whittaker diagram approach
export function classifyBiome(elevation: number, moisture: number, temperature: number): BiomeType {
    // Water bodies
    if (elevation < -0.3) return BiomeType.DEEP_OCEAN;
    if (elevation < -0.15) return BiomeType.OCEAN;
    if (elevation < -0.05) return BiomeType.COASTAL_WATER;
    if (elevation < 0.02) return BiomeType.BEACH;

    // High elevation (mountains)
    if (elevation > 0.55) return BiomeType.SNOW_PEAKS;
    if (elevation > 0.4) return BiomeType.MOUNTAINS;
    if (elevation > 0.25) return BiomeType.HILLS;

    // Temperature-based for cold regions
    if (temperature < 0.25) return BiomeType.TUNDRA;

    // Moisture and temperature combinations
    if (moisture < 0.25) {
        // Dry regions
        return BiomeType.DESERT;
    }

    if (moisture < 0.4) {
        // Semi-arid
        if (temperature > 0.6) return BiomeType.DESERT;
        return BiomeType.PLAINS;
    }

    if (moisture > 0.7) {
        // Wet regions
        if (temperature > 0.65) return BiomeType.JUNGLE;
        if (temperature < 0.35) return BiomeType.SWAMP;
        return BiomeType.FOREST;
    }

    if (moisture > 0.5) {
        // Moderate moisture
        if (temperature > 0.6) return BiomeType.JUNGLE;
        return BiomeType.FOREST;
    }

    // Default temperate
    return BiomeType.PLAINS;
}

// Check if biome is water
export function isWater(biome: BiomeType): boolean {
    return biome === BiomeType.DEEP_OCEAN ||
           biome === BiomeType.OCEAN ||
           biome === BiomeType.COASTAL_WATER ||
           biome === BiomeType.LAKE ||
           biome === BiomeType.RIVER;
}

// Check if biome is suitable for cities
export function isCitySuitable(biome: BiomeType): boolean {
    return biome === BiomeType.PLAINS ||
           biome === BiomeType.FOREST ||
           biome === BiomeType.HILLS ||
           biome === BiomeType.BEACH;
}
