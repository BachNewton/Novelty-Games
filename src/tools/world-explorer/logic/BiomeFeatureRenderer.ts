// Biome Feature Renderer - draws visible terrain features at high zoom
// Trees, rocks, grass, cacti, coastlines, etc.

import { BiomeType, Tile } from '../data/ChunkTypes';
import { createNoiseGenerator } from './Noise';

export interface BiomeFeatureRenderer {
    renderTileFeatures(
        ctx: CanvasRenderingContext2D,
        tile: Tile,
        worldX: number,
        worldY: number,
        screenX: number,
        screenY: number,
        tileScreenSize: number,
        neighborTiles?: NeighborTiles
    ): void;
}

// Neighbor tiles for coastline detection
export interface NeighborTiles {
    north?: Tile;
    south?: Tile;
    east?: Tile;
    west?: Tile;
}

// Feature configuration per biome
interface BiomeFeatureConfig {
    minZoom: number;
    maxFeaturesPerTile: number;
    featureType: 'tree' | 'rock' | 'grass' | 'cactus' | 'reed' | 'shrub' | 'snow' | 'none';
    featureColor: string;
    featureColorAlt?: string;  // Secondary color for variation
    sizeMultiplier: number;
}

const BIOME_FEATURE_CONFIG: Record<BiomeType, BiomeFeatureConfig> = {
    [BiomeType.DEEP_OCEAN]: { minZoom: 999, maxFeaturesPerTile: 0, featureType: 'none', featureColor: '#000', sizeMultiplier: 1 },
    [BiomeType.OCEAN]: { minZoom: 999, maxFeaturesPerTile: 0, featureType: 'none', featureColor: '#000', sizeMultiplier: 1 },
    [BiomeType.COASTAL_WATER]: { minZoom: 999, maxFeaturesPerTile: 0, featureType: 'none', featureColor: '#000', sizeMultiplier: 1 },
    [BiomeType.BEACH]: { minZoom: 20, maxFeaturesPerTile: 2, featureType: 'rock', featureColor: '#c8b89a', featureColorAlt: '#b8a88a', sizeMultiplier: 0.6 },
    [BiomeType.PLAINS]: { minZoom: 15, maxFeaturesPerTile: 4, featureType: 'grass', featureColor: '#7a9a5a', featureColorAlt: '#8aaa6a', sizeMultiplier: 0.8 },
    [BiomeType.FOREST]: { minZoom: 8, maxFeaturesPerTile: 6, featureType: 'tree', featureColor: '#2a5a2a', featureColorAlt: '#3a6a3a', sizeMultiplier: 1.0 },
    [BiomeType.JUNGLE]: { minZoom: 8, maxFeaturesPerTile: 8, featureType: 'tree', featureColor: '#1a4a2a', featureColorAlt: '#2a5a3a', sizeMultiplier: 1.2 },
    [BiomeType.DESERT]: { minZoom: 12, maxFeaturesPerTile: 2, featureType: 'cactus', featureColor: '#5a8a4a', featureColorAlt: '#6a9a5a', sizeMultiplier: 1.0 },
    [BiomeType.HILLS]: { minZoom: 10, maxFeaturesPerTile: 3, featureType: 'shrub', featureColor: '#6a8a5a', featureColorAlt: '#5a7a4a', sizeMultiplier: 0.8 },
    [BiomeType.MOUNTAINS]: { minZoom: 8, maxFeaturesPerTile: 5, featureType: 'rock', featureColor: '#6a5a4a', featureColorAlt: '#5a4a3a', sizeMultiplier: 1.2 },
    [BiomeType.SNOW_PEAKS]: { minZoom: 10, maxFeaturesPerTile: 3, featureType: 'snow', featureColor: '#f8f8ff', featureColorAlt: '#e8e8f0', sizeMultiplier: 1.0 },
    [BiomeType.TUNDRA]: { minZoom: 12, maxFeaturesPerTile: 2, featureType: 'shrub', featureColor: '#7a8a7a', featureColorAlt: '#6a7a6a', sizeMultiplier: 0.6 },
    [BiomeType.SWAMP]: { minZoom: 10, maxFeaturesPerTile: 5, featureType: 'reed', featureColor: '#4a6a3a', featureColorAlt: '#5a7a4a', sizeMultiplier: 1.0 },
    [BiomeType.LAKE]: { minZoom: 999, maxFeaturesPerTile: 0, featureType: 'none', featureColor: '#000', sizeMultiplier: 1 },
    [BiomeType.RIVER]: { minZoom: 999, maxFeaturesPerTile: 0, featureType: 'none', featureColor: '#000', sizeMultiplier: 1 }
};

// Water biomes for coastline detection
const WATER_BIOMES = new Set([
    BiomeType.DEEP_OCEAN,
    BiomeType.OCEAN,
    BiomeType.COASTAL_WATER,
    BiomeType.LAKE,
    BiomeType.RIVER
]);

export function createBiomeFeatureRenderer(seed: number): BiomeFeatureRenderer {
    const featureNoise = createNoiseGenerator(seed + 3000);
    const positionNoise = createNoiseGenerator(seed + 4000);
    const sizeNoise = createNoiseGenerator(seed + 5000);

    // Draw a simple tree (triangle + trunk)
    function drawTree(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        size: number,
        color: string,
        zoom: number
    ) {
        const trunkHeight = size * 0.3;
        const trunkWidth = size * 0.15;
        const canopyHeight = size * 0.8;
        const canopyWidth = size * 0.7;

        // Trunk
        ctx.fillStyle = '#5a4030';
        ctx.fillRect(x - trunkWidth / 2, y - trunkHeight, trunkWidth, trunkHeight);

        // Canopy - triangle at low zoom, more detailed at high zoom
        ctx.fillStyle = color;
        ctx.beginPath();
        if (zoom < 20) {
            // Simple triangle
            ctx.moveTo(x, y - trunkHeight - canopyHeight);
            ctx.lineTo(x - canopyWidth / 2, y - trunkHeight);
            ctx.lineTo(x + canopyWidth / 2, y - trunkHeight);
        } else {
            // Layered triangles for more detail
            const layers = 3;
            for (let i = 0; i < layers; i++) {
                const layerY = y - trunkHeight - (canopyHeight * i / layers);
                const layerWidth = canopyWidth * (1 - i * 0.2);
                const layerHeight = canopyHeight / layers * 1.3;
                ctx.moveTo(x, layerY - layerHeight);
                ctx.lineTo(x - layerWidth / 2, layerY);
                ctx.lineTo(x + layerWidth / 2, layerY);
            }
        }
        ctx.closePath();
        ctx.fill();
    }

    // Draw a rock/boulder
    function drawRock(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        size: number,
        color: string,
        variation: number
    ) {
        ctx.fillStyle = color;
        ctx.beginPath();

        // Irregular polygon based on variation
        const points = 5 + Math.floor(variation * 3);
        const angleStep = (Math.PI * 2) / points;

        for (let i = 0; i < points; i++) {
            const angle = angleStep * i - Math.PI / 2;
            const radiusVar = 0.7 + variation * 0.6;
            const radius = size * radiusVar * (0.8 + Math.sin(i * 2.3 + variation * 10) * 0.2);
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius * 0.7; // Flatten slightly
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Darker edge for 3D effect
        ctx.strokeStyle = darkenColor(color, 0.7);
        ctx.lineWidth = Math.max(1, size * 0.1);
        ctx.stroke();
    }

    // Draw grass tufts
    function drawGrass(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        size: number,
        color: string,
        variation: number
    ) {
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1, size * 0.1);

        const blades = 3 + Math.floor(variation * 3);
        const spread = size * 0.4;

        for (let i = 0; i < blades; i++) {
            const offsetX = (i - blades / 2) * spread / blades;
            const height = size * (0.6 + variation * 0.4);
            const curve = (variation - 0.5) * size * 0.3;

            ctx.beginPath();
            ctx.moveTo(x + offsetX, y);
            ctx.quadraticCurveTo(x + offsetX + curve, y - height / 2, x + offsetX + curve * 0.5, y - height);
            ctx.stroke();
        }
    }

    // Draw cactus
    function drawCactus(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        size: number,
        color: string,
        variation: number
    ) {
        const bodyWidth = size * 0.25;
        const bodyHeight = size * 0.9;

        // Main body
        ctx.fillStyle = color;
        ctx.fillRect(x - bodyWidth / 2, y - bodyHeight, bodyWidth, bodyHeight);

        // Arms (based on variation)
        if (variation > 0.3) {
            const armY = y - bodyHeight * 0.6;
            const armLength = size * 0.3;
            const armWidth = bodyWidth * 0.7;

            // Left arm
            ctx.fillRect(x - bodyWidth / 2 - armLength, armY, armLength, armWidth);
            ctx.fillRect(x - bodyWidth / 2 - armLength, armY - armLength * 0.8, armWidth, armLength * 0.8);
        }
        if (variation > 0.6) {
            const armY = y - bodyHeight * 0.4;
            const armLength = size * 0.25;
            const armWidth = bodyWidth * 0.6;

            // Right arm
            ctx.fillRect(x + bodyWidth / 2, armY, armLength, armWidth);
            ctx.fillRect(x + bodyWidth / 2 + armLength - armWidth, armY - armLength * 0.7, armWidth, armLength * 0.7);
        }

        // Darker outline
        ctx.strokeStyle = darkenColor(color, 0.8);
        ctx.lineWidth = 1;
        ctx.strokeRect(x - bodyWidth / 2, y - bodyHeight, bodyWidth, bodyHeight);
    }

    // Draw reeds/cattails
    function drawReed(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        size: number,
        color: string,
        variation: number
    ) {
        const stemHeight = size * (0.8 + variation * 0.3);
        const stemWidth = Math.max(1, size * 0.08);

        // Stem
        ctx.strokeStyle = color;
        ctx.lineWidth = stemWidth;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + variation * size * 0.1, y - stemHeight);
        ctx.stroke();

        // Cattail head
        ctx.fillStyle = '#5a4030';
        const headHeight = size * 0.2;
        const headWidth = size * 0.12;
        ctx.beginPath();
        ctx.ellipse(x + variation * size * 0.1, y - stemHeight + headHeight / 2, headWidth, headHeight, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw shrub/bush
    function drawShrub(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        size: number,
        color: string,
        variation: number
    ) {
        ctx.fillStyle = color;

        // Multiple overlapping circles
        const circles = 2 + Math.floor(variation * 2);
        for (let i = 0; i < circles; i++) {
            const offsetX = (i - circles / 2) * size * 0.25;
            const offsetY = Math.abs(offsetX) * 0.3;
            const radius = size * (0.3 + variation * 0.15);
            ctx.beginPath();
            ctx.arc(x + offsetX, y - radius - offsetY, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Draw snow patch
    function drawSnow(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        size: number,
        color: string,
        variation: number
    ) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.6 + variation * 0.3;

        // Irregular snow patch
        ctx.beginPath();
        const points = 6;
        for (let i = 0; i < points; i++) {
            const angle = (Math.PI * 2 * i) / points;
            const radius = size * (0.4 + variation * 0.3);
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius * 0.5;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // Draw coastline detail (waves/foam)
    function drawCoastline(
        ctx: CanvasRenderingContext2D,
        screenX: number,
        screenY: number,
        tileScreenSize: number,
        worldX: number,
        worldY: number,
        edges: { north: boolean; south: boolean; east: boolean; west: boolean }
    ) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = Math.max(1, tileScreenSize * 0.08);

        const waveAmplitude = tileScreenSize * 0.1;
        const segments = Math.max(3, Math.floor(tileScreenSize / 4));

        // Draw wavy lines on water edges
        if (edges.north) {
            ctx.beginPath();
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const sx = screenX + t * tileScreenSize;
                const waveOffset = Math.sin(worldX * 2 + t * Math.PI * 2 + worldY) * waveAmplitude;
                const sy = screenY + waveOffset;
                if (i === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
        }
        if (edges.south) {
            ctx.beginPath();
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const sx = screenX + t * tileScreenSize;
                const waveOffset = Math.sin(worldX * 2 + t * Math.PI * 2 + worldY + 1) * waveAmplitude;
                const sy = screenY + tileScreenSize + waveOffset;
                if (i === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
        }
        if (edges.west) {
            ctx.beginPath();
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const sy = screenY + t * tileScreenSize;
                const waveOffset = Math.sin(worldY * 2 + t * Math.PI * 2 + worldX) * waveAmplitude;
                const sx = screenX + waveOffset;
                if (i === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
        }
        if (edges.east) {
            ctx.beginPath();
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const sy = screenY + t * tileScreenSize;
                const waveOffset = Math.sin(worldY * 2 + t * Math.PI * 2 + worldX + 1) * waveAmplitude;
                const sx = screenX + tileScreenSize + waveOffset;
                if (i === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
        }

        // Add foam dots near edges
        if (tileScreenSize >= 15) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            const foamCount = Math.floor(tileScreenSize / 8);
            for (let i = 0; i < foamCount; i++) {
                const noiseVal = featureNoise.noise2D(worldX * 10 + i, worldY * 10);
                if (noiseVal > 0.3) {
                    let fx = screenX + tileScreenSize * 0.5;
                    let fy = screenY + tileScreenSize * 0.5;

                    // Position foam near the water edge
                    if (edges.north) fy = screenY + tileScreenSize * 0.1 * (1 + noiseVal);
                    else if (edges.south) fy = screenY + tileScreenSize * (0.9 - 0.1 * noiseVal);
                    if (edges.west) fx = screenX + tileScreenSize * 0.1 * (1 + noiseVal);
                    else if (edges.east) fx = screenX + tileScreenSize * (0.9 - 0.1 * noiseVal);

                    const foamSize = tileScreenSize * 0.05 * (0.5 + noiseVal);
                    ctx.beginPath();
                    ctx.arc(fx + noiseVal * tileScreenSize * 0.2, fy, foamSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    function darkenColor(hex: string, factor: number): string {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v * factor)));
        return '#' + [r, g, b].map(v => clamp(v).toString(16).padStart(2, '0')).join('');
    }

    function renderTileFeatures(
        ctx: CanvasRenderingContext2D,
        tile: Tile,
        worldX: number,
        worldY: number,
        screenX: number,
        screenY: number,
        tileScreenSize: number,
        neighborTiles?: NeighborTiles
    ) {
        const config = BIOME_FEATURE_CONFIG[tile.biome];
        const zoom = tileScreenSize;

        // Check coastline first (for water tiles adjacent to land)
        if (WATER_BIOMES.has(tile.biome) && neighborTiles && zoom >= 10) {
            const edges = {
                north: neighborTiles.north ? !WATER_BIOMES.has(neighborTiles.north.biome) : false,
                south: neighborTiles.south ? !WATER_BIOMES.has(neighborTiles.south.biome) : false,
                east: neighborTiles.east ? !WATER_BIOMES.has(neighborTiles.east.biome) : false,
                west: neighborTiles.west ? !WATER_BIOMES.has(neighborTiles.west.biome) : false
            };

            if (edges.north || edges.south || edges.east || edges.west) {
                drawCoastline(ctx, screenX, screenY, tileScreenSize, worldX, worldY, edges);
            }
        }

        // Skip if below minimum zoom or no features for this biome
        if (zoom < config.minZoom || config.featureType === 'none') {
            return;
        }

        // Skip features in city areas
        if (tile.cityId) {
            return;
        }

        // Determine number of features based on noise
        const densityNoise = featureNoise.noise2D(worldX * 0.5, worldY * 0.5);
        const baseCount = Math.floor((densityNoise + 1) / 2 * config.maxFeaturesPerTile);
        const featureCount = Math.min(baseCount, Math.floor(zoom / 10) + 1);

        if (featureCount === 0) return;

        // Calculate base feature size (scales with zoom)
        const baseSize = tileScreenSize * 0.3 * config.sizeMultiplier;

        // Generate and draw features
        for (let i = 0; i < featureCount; i++) {
            // Use noise for consistent positioning
            const posX = positionNoise.noise2D(worldX * 10 + i * 100, worldY * 10);
            const posY = positionNoise.noise2D(worldX * 10, worldY * 10 + i * 100);
            const sizeVar = sizeNoise.noise2D(worldX * 5 + i * 50, worldY * 5);
            const variation = (sizeVar + 1) / 2; // 0-1

            // Position within tile (avoid edges)
            const margin = 0.15;
            const fx = screenX + tileScreenSize * (margin + (1 - 2 * margin) * (posX + 1) / 2);
            const fy = screenY + tileScreenSize * (margin + (1 - 2 * margin) * (posY + 1) / 2);

            // Size variation
            const size = baseSize * (0.7 + variation * 0.6);

            // Color selection
            const color = variation > 0.5 && config.featureColorAlt ? config.featureColorAlt : config.featureColor;

            // Draw based on feature type
            switch (config.featureType) {
                case 'tree':
                    drawTree(ctx, fx, fy, size, color, zoom);
                    break;
                case 'rock':
                    drawRock(ctx, fx, fy, size, color, variation);
                    break;
                case 'grass':
                    drawGrass(ctx, fx, fy, size, color, variation);
                    break;
                case 'cactus':
                    drawCactus(ctx, fx, fy, size, color, variation);
                    break;
                case 'reed':
                    drawReed(ctx, fx, fy, size, color, variation);
                    break;
                case 'shrub':
                    drawShrub(ctx, fx, fy, size, color, variation);
                    break;
                case 'snow':
                    drawSnow(ctx, fx, fy, size, color, variation);
                    break;
            }
        }
    }

    return {
        renderTileFeatures
    };
}
