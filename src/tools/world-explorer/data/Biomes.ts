import { BiomeType } from './ChunkTypes';

// Fantasy/parchment style biome colors
export interface BiomeStyle {
    fill: string;
    stroke?: string;
}

export const BIOME_COLORS: Record<BiomeType, BiomeStyle> = {
    [BiomeType.DEEP_OCEAN]: { fill: '#2a4858', stroke: '#1a3848' },
    [BiomeType.OCEAN]: { fill: '#3a6878', stroke: '#2a5868' },
    [BiomeType.COASTAL_WATER]: { fill: '#4a8898', stroke: '#3a7888' },
    [BiomeType.BEACH]: { fill: '#e8d8a8', stroke: '#d8c898' },
    [BiomeType.PLAINS]: { fill: '#b8c87a', stroke: '#a8b86a' },
    [BiomeType.FOREST]: { fill: '#4a7a4a', stroke: '#3a6a3a' },
    [BiomeType.JUNGLE]: { fill: '#2a5a3a', stroke: '#1a4a2a' },
    [BiomeType.DESERT]: { fill: '#d8c878', stroke: '#c8b868' },
    [BiomeType.HILLS]: { fill: '#9aaa6a', stroke: '#8a9a5a' },
    [BiomeType.MOUNTAINS]: { fill: '#8a7a6a', stroke: '#7a6a5a' },
    [BiomeType.SNOW_PEAKS]: { fill: '#e8e8f0', stroke: '#d8d8e0' },
    [BiomeType.TUNDRA]: { fill: '#a8b8b8', stroke: '#98a8a8' },
    [BiomeType.SWAMP]: { fill: '#5a6a4a', stroke: '#4a5a3a' },
    [BiomeType.LAKE]: { fill: '#5a8aa8', stroke: '#4a7a98' },
    [BiomeType.RIVER]: { fill: '#4a7ab0', stroke: '#3a6aa0' }
};

// Biome names for labels
export const BIOME_NAMES: Record<BiomeType, string> = {
    [BiomeType.DEEP_OCEAN]: 'Deep Ocean',
    [BiomeType.OCEAN]: 'Ocean',
    [BiomeType.COASTAL_WATER]: 'Sea',
    [BiomeType.BEACH]: 'Coast',
    [BiomeType.PLAINS]: 'Plains',
    [BiomeType.FOREST]: 'Forest',
    [BiomeType.JUNGLE]: 'Jungle',
    [BiomeType.DESERT]: 'Desert',
    [BiomeType.HILLS]: 'Hills',
    [BiomeType.MOUNTAINS]: 'Mountains',
    [BiomeType.SNOW_PEAKS]: 'Peaks',
    [BiomeType.TUNDRA]: 'Tundra',
    [BiomeType.SWAMP]: 'Swamp',
    [BiomeType.LAKE]: 'Lake',
    [BiomeType.RIVER]: 'River'
};
