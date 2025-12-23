// Terrain detail renderer - adds zoom-dependent visual detail to terrain
// Features: hillshade, micro-terrain variation, biome-specific textures

import { BiomeType } from '../data/ChunkTypes';
import { createNoiseGenerator } from './Noise';

export interface TerrainDetailRenderer {
    getDetailColor(
        baseColor: string,
        biome: BiomeType,
        elevation: number,
        worldX: number,
        worldY: number,
        zoom: number
    ): string;
}

// Color manipulation helpers
function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { r: 128, g: 128, b: 128 };
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    };
}

function rgbToHex(r: number, g: number, b: number): string {
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    return '#' + [r, g, b].map(v => clamp(v).toString(16).padStart(2, '0')).join('');
}

function adjustBrightness(rgb: { r: number; g: number; b: number }, factor: number): { r: number; g: number; b: number } {
    // factor > 1 = brighter, factor < 1 = darker
    return {
        r: rgb.r * factor,
        g: rgb.g * factor,
        b: rgb.b * factor
    };
}

// Biome-specific detail configurations
interface BiomeDetailConfig {
    variationIntensity: number;  // How much color variation (0-1)
    textureScale: number;        // Scale of texture pattern
    textureType: 'noise' | 'ripple' | 'spots' | 'streaks';
    textureIntensity: number;    // How strong the texture effect is (0-1)
}

const BIOME_DETAIL_CONFIG: Partial<Record<BiomeType, BiomeDetailConfig>> = {
    [BiomeType.DEEP_OCEAN]: { variationIntensity: 0.03, textureScale: 0.3, textureType: 'ripple', textureIntensity: 0.08 },
    [BiomeType.OCEAN]: { variationIntensity: 0.04, textureScale: 0.4, textureType: 'ripple', textureIntensity: 0.1 },
    [BiomeType.COASTAL_WATER]: { variationIntensity: 0.05, textureScale: 0.5, textureType: 'ripple', textureIntensity: 0.12 },
    [BiomeType.BEACH]: { variationIntensity: 0.08, textureScale: 0.8, textureType: 'ripple', textureIntensity: 0.15 },
    [BiomeType.PLAINS]: { variationIntensity: 0.06, textureScale: 0.6, textureType: 'streaks', textureIntensity: 0.12 },
    [BiomeType.FOREST]: { variationIntensity: 0.12, textureScale: 0.4, textureType: 'spots', textureIntensity: 0.2 },
    [BiomeType.JUNGLE]: { variationIntensity: 0.15, textureScale: 0.35, textureType: 'spots', textureIntensity: 0.25 },
    [BiomeType.DESERT]: { variationIntensity: 0.07, textureScale: 1.2, textureType: 'ripple', textureIntensity: 0.18 },
    [BiomeType.HILLS]: { variationIntensity: 0.1, textureScale: 0.5, textureType: 'noise', textureIntensity: 0.15 },
    [BiomeType.MOUNTAINS]: { variationIntensity: 0.18, textureScale: 0.6, textureType: 'noise', textureIntensity: 0.25 },
    [BiomeType.SNOW_PEAKS]: { variationIntensity: 0.08, textureScale: 0.7, textureType: 'noise', textureIntensity: 0.12 },
    [BiomeType.TUNDRA]: { variationIntensity: 0.06, textureScale: 0.5, textureType: 'spots', textureIntensity: 0.1 },
    [BiomeType.SWAMP]: { variationIntensity: 0.1, textureScale: 0.4, textureType: 'spots', textureIntensity: 0.18 },
    [BiomeType.LAKE]: { variationIntensity: 0.03, textureScale: 0.5, textureType: 'ripple', textureIntensity: 0.08 },
    [BiomeType.RIVER]: { variationIntensity: 0.04, textureScale: 0.6, textureType: 'ripple', textureIntensity: 0.1 }
};

const DEFAULT_CONFIG: BiomeDetailConfig = {
    variationIntensity: 0.08,
    textureScale: 0.5,
    textureType: 'noise',
    textureIntensity: 0.15
};

export function createTerrainDetailRenderer(seed: number): TerrainDetailRenderer {
    // Create noise generators for different detail layers
    const detailNoise = createNoiseGenerator(seed + 1000);
    const textureNoise = createNoiseGenerator(seed + 2000);
    const hillshadeNoise = createNoiseGenerator(seed);  // Same as terrain for consistent hills

    // Light direction for hillshade (from northwest, typical cartography)
    const lightDirX = -0.7071;  // -1/sqrt(2)
    const lightDirY = 0.7071;   // 1/sqrt(2)

    function getHillshade(worldX: number, worldY: number): number {
        // Sample elevation at neighboring points to compute gradient
        const sampleDist = 0.5;  // Half a tile for smooth gradients

        // Use terrain-like noise sampling (matching TerrainGenerator scales)
        const getHeight = (x: number, y: number) => {
            const continent = hillshadeNoise.octaveNoise2D(x * 0.002, y * 0.002, 4, 0.5, 2.0);
            const mountains = hillshadeNoise.ridgedNoise2D(x * 0.015, y * 0.015, 4, 0.5, 2.0);
            const landMask = Math.max(0, Math.min(1, (continent + 0.1) / 0.3));
            return continent * 0.4 + mountains * 0.5 * landMask;
        };

        const heightLeft = getHeight(worldX - sampleDist, worldY);
        const heightRight = getHeight(worldX + sampleDist, worldY);
        const heightDown = getHeight(worldX, worldY - sampleDist);
        const heightUp = getHeight(worldX, worldY + sampleDist);

        // Compute gradient (slope in x and y)
        const gradX = (heightRight - heightLeft) / (2 * sampleDist);
        const gradY = (heightUp - heightDown) / (2 * sampleDist);

        // Compute surface normal (simplified - assumes small gradients)
        // Normal = normalize(-gradX, -gradY, 1)
        const normalZ = 1;
        const normalLen = Math.sqrt(gradX * gradX + gradY * gradY + normalZ * normalZ);
        const nx = -gradX / normalLen;
        const ny = -gradY / normalLen;

        // Dot product with light direction (only x,y components matter for 2D shading)
        const shade = nx * lightDirX + ny * lightDirY;

        // Map from [-1, 1] to brightness factor [0.85, 1.15]
        return 1 + shade * 0.15;
    }

    function getMicroVariation(worldX: number, worldY: number, config: BiomeDetailConfig): number {
        // Fine-scale noise for organic color variation
        const noise = detailNoise.noise2D(worldX * 0.5, worldY * 0.5);
        return 1 + noise * config.variationIntensity;
    }

    function getTexturePattern(worldX: number, worldY: number, config: BiomeDetailConfig): number {
        const scale = config.textureScale;

        switch (config.textureType) {
            case 'ripple': {
                // Wavy pattern for water/sand
                const wave1 = Math.sin(worldX * scale * 2 + worldY * scale * 0.5);
                const wave2 = Math.sin(worldX * scale * 0.3 + worldY * scale * 1.5);
                const noiseOffset = textureNoise.noise2D(worldX * scale * 0.5, worldY * scale * 0.5) * 0.5;
                return 1 + (wave1 * 0.3 + wave2 * 0.2 + noiseOffset) * config.textureIntensity;
            }
            case 'spots': {
                // Dappled pattern for forests/vegetation
                const noise1 = textureNoise.noise2D(worldX * scale, worldY * scale);
                const noise2 = textureNoise.noise2D(worldX * scale * 2.3, worldY * scale * 2.3) * 0.5;
                // Threshold to create spots
                const combined = noise1 + noise2;
                const spotted = combined > 0.3 ? 1 + config.textureIntensity * 0.5 :
                               combined < -0.3 ? 1 - config.textureIntensity * 0.5 : 1;
                return spotted;
            }
            case 'streaks': {
                // Directional pattern for grass/plains
                const angle = 0.3;  // Slight angle for natural look
                const rotX = worldX * Math.cos(angle) - worldY * Math.sin(angle);
                const streak = Math.sin(rotX * scale * 3) * 0.5 + 0.5;
                const noise = textureNoise.noise2D(worldX * scale * 0.8, worldY * scale * 0.8) * 0.3;
                return 1 + (streak * 0.6 + noise) * config.textureIntensity - config.textureIntensity * 0.3;
            }
            case 'noise':
            default: {
                // Pure noise for rocky terrain
                const n1 = textureNoise.noise2D(worldX * scale, worldY * scale);
                const n2 = textureNoise.noise2D(worldX * scale * 2.5, worldY * scale * 2.5) * 0.4;
                const n3 = textureNoise.noise2D(worldX * scale * 6, worldY * scale * 6) * 0.2;
                return 1 + (n1 + n2 + n3) * config.textureIntensity;
            }
        }
    }

    function getDetailColor(
        baseColor: string,
        biome: BiomeType,
        _elevation: number,
        worldX: number,
        worldY: number,
        zoom: number
    ): string {
        // Get base RGB
        const rgb = hexToRgb(baseColor);
        const config = BIOME_DETAIL_CONFIG[biome] || DEFAULT_CONFIG;

        let brightnessFactor = 1;

        // Tier 1: Hillshade (zoom >= 2, tileScreenSize >= 8)
        if (zoom >= 2) {
            brightnessFactor *= getHillshade(worldX, worldY);
        }

        // Tier 2: Micro-terrain variation (zoom >= 8, tileScreenSize >= 32)
        if (zoom >= 8) {
            brightnessFactor *= getMicroVariation(worldX, worldY, config);
        }

        // Tier 3: Biome textures (zoom >= 20, tileScreenSize >= 80)
        if (zoom >= 20) {
            brightnessFactor *= getTexturePattern(worldX, worldY, config);
        }

        // Apply brightness adjustment
        const adjusted = adjustBrightness(rgb, brightnessFactor);
        return rgbToHex(adjusted.r, adjusted.g, adjusted.b);
    }

    return {
        getDetailColor
    };
}
