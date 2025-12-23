import { useEffect, useRef, useCallback } from 'react';
import {
    Viewport,
    createViewport,
    panViewport,
    zoomViewportAt,
    getViewportBounds
} from '../logic/Viewport';
import { CHUNK_SIZE, worldToChunk, getChunkKey, Chunk, BiomeType } from '../data/ChunkTypes';
import { createWorldGenerator, WorldGenerator } from '../logic/WorldGenerator';
import { BIOME_COLORS } from '../data/Biomes';
import { createChunkWorkerClient, ChunkWorkerClient } from '../workers/ChunkWorkerClient';
import { createTerrainDetailRenderer, TerrainDetailRenderer } from '../logic/TerrainDetailRenderer';
import { createBiomeFeatureRenderer, BiomeFeatureRenderer } from '../logic/BiomeFeatureRenderer';

interface WorldCanvasProps {
    seed: number;
    onCoordinateChange?: (x: number, y: number, zoom: number) => void;
}

// Cache for low-detail terrain rendering
interface LowDetailCache {
    canvas: HTMLCanvasElement;
    centerX: number;
    centerY: number;
    zoom: number;
    width: number;
    height: number;
}

const WorldCanvas: React.FC<WorldCanvasProps> = ({ seed, onCoordinateChange }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const viewportRef = useRef<Viewport>(createViewport(0, 0, 4));
    const isDraggingRef = useRef(false);
    const lastMousePosRef = useRef({ x: 0, y: 0 });
    const lastTouchDistanceRef = useRef(0);
    const animationFrameRef = useRef<number | null>(null);
    const chunksRef = useRef<Map<string, Chunk>>(new Map());
    const generatorRef = useRef<WorldGenerator | null>(null);
    const lowDetailCacheRef = useRef<LowDetailCache | null>(null);
    const workerClientRef = useRef<ChunkWorkerClient | null>(null);
    const pendingChunksRef = useRef<Set<string>>(new Set());
    const shimmerPhaseRef = useRef(0);
    const shimmerAnimationRef = useRef<number | null>(null);
    const gradientCacheRef = useRef<{ gradient: CanvasGradient; width: number; height: number } | null>(null);
    const detailRendererRef = useRef<TerrainDetailRenderer | null>(null);
    const featureRendererRef = useRef<BiomeFeatureRenderer | null>(null);

    // Initialize generator, detail renderer, and worker when seed changes
    useEffect(() => {
        generatorRef.current = createWorldGenerator(seed);
        detailRendererRef.current = createTerrainDetailRenderer(seed);
        featureRendererRef.current = createBiomeFeatureRenderer(seed);
        chunksRef.current.clear();
        lowDetailCacheRef.current = null;
        pendingChunksRef.current.clear();

        // Initialize or update worker
        if (!workerClientRef.current) {
            workerClientRef.current = createChunkWorkerClient(seed);
        } else {
            workerClientRef.current.updateSeed(seed);
        }

        return () => {
            if (workerClientRef.current) {
                workerClientRef.current.terminate();
                workerClientRef.current = null;
            }
        };
    }, [seed]);

    // Set up worker callback to handle generated chunks
    useEffect(() => {
        const workerClient = workerClientRef.current;
        if (!workerClient) return;

        workerClient.onChunkReady((chunk) => {
            const key = getChunkKey(chunk.coord);

            // Add to cache
            chunksRef.current.set(key, chunk);

            // Remove from pending
            pendingChunksRef.current.delete(key);

            // Limit cache size (LRU-style)
            if (chunksRef.current.size > 200) {
                const firstKey = chunksRef.current.keys().next().value;
                if (firstKey) chunksRef.current.delete(firstKey);
            }

            // Schedule re-render to display the new chunk
            if (animationFrameRef.current === null) {
                animationFrameRef.current = requestAnimationFrame(() => {
                    const canvas = canvasRef.current;
                    const ctx = canvas?.getContext('2d');
                    const viewport = viewportRef.current;
                    const generator = generatorRef.current;

                    if (canvas && ctx && generator) {
                        // Full re-render
                        const width = canvas.width;
                        const height = canvas.height;

                        let gradientCache = gradientCacheRef.current;
                        if (gradientCache) {
                            ctx.fillStyle = gradientCache.gradient;
                            ctx.fillRect(0, 0, width, height);
                        }

                        const bounds = getViewportBounds(viewport, width, height);
                        const minChunk = worldToChunk(bounds.minX, bounds.minY);
                        const maxChunk = worldToChunk(bounds.maxX, bounds.maxY);
                        const chunksX = maxChunk.chunkX - minChunk.chunkX + 3;
                        const chunksY = maxChunk.chunkY - minChunk.chunkY + 3;
                        const totalChunks = chunksX * chunksY;

                        if (totalChunks <= 100 && viewport.zoom >= 0.5) {
                            for (let cy = minChunk.chunkY - 1; cy <= maxChunk.chunkY + 1; cy++) {
                                for (let cx = minChunk.chunkX - 1; cx <= maxChunk.chunkX + 1; cx++) {
                                    const k = getChunkKey({ chunkX: cx, chunkY: cy });
                                    const c = chunksRef.current.get(k);
                                    if (c) {
                                        renderChunk(ctx, c, viewport, width, height);
                                    }
                                }
                            }

                            for (let cy = minChunk.chunkY - 1; cy <= maxChunk.chunkY + 1; cy++) {
                                for (let cx = minChunk.chunkX - 1; cx <= maxChunk.chunkX + 1; cx++) {
                                    const k = getChunkKey({ chunkX: cx, chunkY: cy });
                                    const c = chunksRef.current.get(k);
                                    if (c) {
                                        renderLabels(ctx, c, viewport, width, height);
                                    }
                                }
                            }
                        }
                    }
                    animationFrameRef.current = null;
                });
            }
        });
    }, [seed]);

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const viewport = viewportRef.current;
        const generator = generatorRef.current;
        const workerClient = workerClientRef.current;

        if (!canvas || !ctx || !generator) return;

        const width = canvas.width;
        const height = canvas.height;

        // Draw parchment background (cached gradient)
        let gradientCache = gradientCacheRef.current;
        if (!gradientCache || gradientCache.width !== width || gradientCache.height !== height) {
            const gradient = ctx.createRadialGradient(
                width / 2, height / 2, 0,
                width / 2, height / 2, Math.max(width, height) / 2
            );
            gradient.addColorStop(0, '#f4e4bc');
            gradient.addColorStop(1, '#d4c4a0');
            gradientCacheRef.current = { gradient, width, height };
            gradientCache = gradientCacheRef.current;
        }
        ctx.fillStyle = gradientCache.gradient;
        ctx.fillRect(0, 0, width, height);

        // Get visible bounds
        const bounds = getViewportBounds(viewport, width, height);

        // Calculate visible chunks
        const minChunk = worldToChunk(bounds.minX, bounds.minY);
        const maxChunk = worldToChunk(bounds.maxX, bounds.maxY);

        // Count how many chunks we'd need to render
        const chunksX = maxChunk.chunkX - minChunk.chunkX + 3;
        const chunksY = maxChunk.chunkY - minChunk.chunkY + 3;
        const totalChunks = chunksX * chunksY;

        // When very zoomed out (too many chunks), render simple terrain overview
        if (totalChunks > 100 || viewport.zoom < 0.5) {
            renderLowDetailTerrain(ctx, bounds, viewport, width, height, generator);
        } else {
            // Track if we have any pending chunks for shimmer animation
            let hasPendingChunks = false;

            // Render all visible chunks
            for (let cy = minChunk.chunkY - 1; cy <= maxChunk.chunkY + 1; cy++) {
                for (let cx = minChunk.chunkX - 1; cx <= maxChunk.chunkX + 1; cx++) {
                    const key = getChunkKey({ chunkX: cx, chunkY: cy });
                    const chunk: Chunk | undefined = chunksRef.current.get(key);

                    if (chunk) {
                        renderChunk(ctx, chunk, viewport, width, height);
                    } else {
                        // Request chunk from worker if not already pending
                        if (workerClient && !pendingChunksRef.current.has(key)) {
                            pendingChunksRef.current.add(key);
                            workerClient.requestChunk(cx, cy);
                        }

                        // Render shimmer placeholder for pending chunk
                        hasPendingChunks = true;
                        renderChunkPlaceholder(ctx, { chunkX: cx, chunkY: cy }, viewport, width, height);
                    }
                }
            }

            // Start/stop shimmer animation based on pending chunks
            if (hasPendingChunks && !shimmerAnimationRef.current) {
                const animateShimmer = () => {
                    shimmerPhaseRef.current = (shimmerPhaseRef.current + 0.05) % (Math.PI * 2);
                    shimmerAnimationRef.current = requestAnimationFrame(animateShimmer);
                    // Re-render to update shimmer
                    if (animationFrameRef.current === null) {
                        animationFrameRef.current = requestAnimationFrame(() => {
                            render();
                            animationFrameRef.current = null;
                        });
                    }
                };
                shimmerAnimationRef.current = requestAnimationFrame(animateShimmer);
            } else if (!hasPendingChunks && shimmerAnimationRef.current) {
                cancelAnimationFrame(shimmerAnimationRef.current);
                shimmerAnimationRef.current = null;
            }

            // Render labels on top
            for (let cy = minChunk.chunkY - 1; cy <= maxChunk.chunkY + 1; cy++) {
                for (let cx = minChunk.chunkX - 1; cx <= maxChunk.chunkX + 1; cx++) {
                    const key = getChunkKey({ chunkX: cx, chunkY: cy });
                    const chunk = chunksRef.current.get(key);
                    if (chunk) {
                        renderLabels(ctx, chunk, viewport, width, height);
                    }
                }
            }
        }

        // Notify coordinate change
        onCoordinateChange?.(viewport.centerX, viewport.centerY, viewport.zoom);
    }, [onCoordinateChange]);

    // Low detail terrain for very zoomed out views - uses cached offscreen canvas
    function renderLowDetailTerrain(
        ctx: CanvasRenderingContext2D,
        _bounds: { minX: number; maxX: number; minY: number; maxY: number },
        viewport: Viewport,
        canvasWidth: number,
        canvasHeight: number,
        generator: WorldGenerator
    ) {
        const cache = lowDetailCacheRef.current;

        // Check if we can reuse the cache (viewport hasn't changed much)
        const cacheValid = cache &&
            cache.width === canvasWidth &&
            cache.height === canvasHeight &&
            Math.abs(cache.zoom - viewport.zoom) < viewport.zoom * 0.01 &&
            Math.abs(cache.centerX - viewport.centerX) < canvasWidth / viewport.zoom * 0.1 &&
            Math.abs(cache.centerY - viewport.centerY) < canvasHeight / viewport.zoom * 0.1;

        if (cacheValid) {
            // Calculate offset to pan the cached image
            const offsetX = (cache.centerX - viewport.centerX) * viewport.zoom;
            const offsetY = (viewport.centerY - cache.centerY) * viewport.zoom;
            ctx.drawImage(cache.canvas, offsetX, offsetY);
            return;
        }

        // Generate new low-detail terrain
        const pixelStep = Math.max(4, Math.floor(12 / viewport.zoom));

        // Create or reuse offscreen canvas
        let offscreen: HTMLCanvasElement;
        let offCtx: CanvasRenderingContext2D;

        if (cache && cache.canvas.width === canvasWidth && cache.canvas.height === canvasHeight) {
            offscreen = cache.canvas;
            offCtx = offscreen.getContext('2d')!;
        } else {
            offscreen = document.createElement('canvas');
            offscreen.width = canvasWidth;
            offscreen.height = canvasHeight;
            offCtx = offscreen.getContext('2d')!;
        }

        // Fill with parchment background first
        offCtx.fillStyle = '#e4d4a4';
        offCtx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Sample terrain
        for (let screenY = 0; screenY < canvasHeight; screenY += pixelStep) {
            for (let screenX = 0; screenX < canvasWidth; screenX += pixelStep) {
                const worldX = viewport.centerX + (screenX - canvasWidth / 2) / viewport.zoom;
                const worldY = viewport.centerY - (screenY - canvasHeight / 2) / viewport.zoom;

                const biome = generator.sampleBiome(worldX, worldY);
                offCtx.fillStyle = BIOME_COLORS[biome]?.fill || '#888';
                offCtx.fillRect(screenX, screenY, pixelStep, pixelStep);
            }
        }

        // Cache the result
        lowDetailCacheRef.current = {
            canvas: offscreen,
            centerX: viewport.centerX,
            centerY: viewport.centerY,
            zoom: viewport.zoom,
            width: canvasWidth,
            height: canvasHeight
        };

        // Draw to main canvas
        ctx.drawImage(offscreen, 0, 0);
    }

    function renderChunk(
        ctx: CanvasRenderingContext2D,
        chunk: Chunk,
        viewport: Viewport,
        canvasWidth: number,
        canvasHeight: number
    ) {
        const tileScreenSize = viewport.zoom;

        // Sample tiles with stride for better performance when partially zoomed out
        const tileStride = tileScreenSize < 1 ? 8 : tileScreenSize < 2 ? 4 : tileScreenSize < 4 ? 2 : 1;
        const effectiveTileSize = tileScreenSize * tileStride;

        // Render tiles
        for (let ty = 0; ty < CHUNK_SIZE; ty += tileStride) {
            for (let tx = 0; tx < CHUNK_SIZE; tx += tileStride) {
                const tile = chunk.tiles[ty]?.[tx];
                if (!tile) continue;

                const worldX = chunk.coord.chunkX * CHUNK_SIZE + tx;
                const worldY = chunk.coord.chunkY * CHUNK_SIZE + ty;

                const screenX = canvasWidth / 2 + (worldX - viewport.centerX) * viewport.zoom;
                const screenY = canvasHeight / 2 - (worldY + tileStride - viewport.centerY) * viewport.zoom;

                // Skip tiles outside viewport
                if (screenX + effectiveTileSize < 0 || screenX > canvasWidth ||
                    screenY + effectiveTileSize < 0 || screenY > canvasHeight) {
                    continue;
                }

                const biomeColor = BIOME_COLORS[tile.biome];
                const baseColor = biomeColor?.fill || '#888';

                // Apply terrain detail at higher zoom levels (hillshade starts at zoom 2)
                const detailRenderer = detailRendererRef.current;
                if (detailRenderer && tileScreenSize >= 2) {
                    ctx.fillStyle = detailRenderer.getDetailColor(
                        baseColor,
                        tile.biome,
                        tile.elevation,
                        worldX,
                        worldY,
                        viewport.zoom
                    );
                } else {
                    ctx.fillStyle = baseColor;
                }
                ctx.fillRect(screenX, screenY, effectiveTileSize + 0.5, effectiveTileSize + 0.5);

                // Draw biome features (trees, rocks, etc.) at high zoom
                const featureRenderer = featureRendererRef.current;
                if (featureRenderer && tileStride === 1 && tileScreenSize >= 8) {
                    // Get neighbor tiles for coastline detection
                    const neighborTiles = {
                        north: ty > 0 ? chunk.tiles[ty - 1]?.[tx] : undefined,
                        south: ty < CHUNK_SIZE - 1 ? chunk.tiles[ty + 1]?.[tx] : undefined,
                        west: tx > 0 ? chunk.tiles[ty]?.[tx - 1] : undefined,
                        east: tx < CHUNK_SIZE - 1 ? chunk.tiles[ty]?.[tx + 1] : undefined
                    };

                    featureRenderer.renderTileFeatures(
                        ctx,
                        tile,
                        worldX,
                        worldY,
                        screenX,
                        screenY,
                        tileScreenSize,
                        neighborTiles
                    );
                }

                // Draw rivers (only at higher detail)
                if (tileStride === 1 && tile.riverStrength > 0) {
                    ctx.fillStyle = BIOME_COLORS[BiomeType.RIVER]?.fill || '#4a7ab0';
                    const riverSize = Math.min(tileScreenSize, tileScreenSize * tile.riverStrength * 0.5);
                    const offset = (tileScreenSize - riverSize) / 2;
                    ctx.fillRect(screenX + offset, screenY + offset, riverSize, riverSize);
                }

                // Draw roads at higher zoom
                if (tileStride === 1 && tile.roadType > 0 && tileScreenSize > 2) {
                    // RoadType: 1=DIRT, 2=PAVED, 3=RAIL
                    if (tile.roadType === 3) {
                        // RAIL - distinctive black with white cross-ties
                        const railWidth = tileScreenSize * 0.35;
                        const railOffset = (tileScreenSize - railWidth) / 2;

                        // Rail bed (dark)
                        ctx.fillStyle = '#2a2a2a';
                        ctx.fillRect(screenX + railOffset, screenY + railOffset, railWidth, railWidth);

                        // Cross-ties pattern (lighter)
                        if (tileScreenSize > 4) {
                            ctx.fillStyle = '#6a5a4a';
                            const tieSize = tileScreenSize * 0.12;
                            // Horizontal tie
                            ctx.fillRect(screenX + railOffset - tieSize/2, screenY + tileScreenSize/2 - tieSize/2, railWidth + tieSize, tieSize);
                        }

                        // Rail lines (metallic)
                        if (tileScreenSize > 6) {
                            ctx.fillStyle = '#9a9aaa';
                            const trackWidth = Math.max(1, tileScreenSize * 0.06);
                            ctx.fillRect(screenX + railOffset + railWidth * 0.2, screenY + railOffset, trackWidth, railWidth);
                            ctx.fillRect(screenX + railOffset + railWidth * 0.7, screenY + railOffset, trackWidth, railWidth);
                        }
                    } else {
                        // Roads
                        let roadColor: string;
                        let roadWidth: number;

                        if (tile.roadType === 2) {
                            // PAVED (highways) - wider, darker
                            roadColor = '#5a4a3a';
                            roadWidth = 0.45;
                        } else {
                            // DIRT - narrower, lighter
                            roadColor = '#a89878';
                            roadWidth = 0.3;
                        }

                        ctx.fillStyle = roadColor;
                        const roadSize = tileScreenSize * roadWidth;
                        const roadOffset = (tileScreenSize - roadSize) / 2;
                        ctx.fillRect(screenX + roadOffset, screenY + roadOffset, roadSize, roadSize);
                    }
                }
            }
        }

        // Draw cities at higher zoom
        if (tileScreenSize > 1) {
            for (const city of chunk.cities) {
                const cityCenterX = canvasWidth / 2 + (city.centerX - viewport.centerX) * viewport.zoom;
                const cityCenterY = canvasHeight / 2 - (city.centerY - viewport.centerY) * viewport.zoom;
                const screenRadius = city.radius * viewport.zoom;

                // Skip if city is off screen
                if (cityCenterX + screenRadius < 0 || cityCenterX - screenRadius > canvasWidth ||
                    cityCenterY + screenRadius < 0 || cityCenterY - screenRadius > canvasHeight) {
                    continue;
                }

                // At low zoom, just show marker
                if (tileScreenSize < 8) {
                    ctx.beginPath();
                    ctx.arc(cityCenterX, cityCenterY, Math.max(3, screenRadius * 0.2), 0, Math.PI * 2);
                    ctx.fillStyle = '#2a1a0a';
                    ctx.fill();

                    // City boundary
                    if (tileScreenSize > 4) {
                        ctx.beginPath();
                        ctx.arc(cityCenterX, cityCenterY, screenRadius, 0, Math.PI * 2);
                        ctx.strokeStyle = 'rgba(42, 26, 10, 0.3)';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                } else {
                    // High zoom - draw streets and buildings

                    // Draw buildings first (under streets)
                    if (tileScreenSize > 15) {
                        ctx.fillStyle = '#8b7355';
                        for (const building of city.buildings) {
                            ctx.beginPath();
                            let first = true;
                            for (const point of building.footprint) {
                                const sx = canvasWidth / 2 + (point.worldX - viewport.centerX) * viewport.zoom;
                                const sy = canvasHeight / 2 - (point.worldY - viewport.centerY) * viewport.zoom;
                                if (first) {
                                    ctx.moveTo(sx, sy);
                                    first = false;
                                } else {
                                    ctx.lineTo(sx, sy);
                                }
                            }
                            ctx.closePath();
                            ctx.fill();
                        }
                    }

                    // Draw streets
                    for (const street of city.streets) {
                        if (street.points.length < 2) continue;

                        ctx.beginPath();
                        ctx.strokeStyle = street.type === 'main' ? '#5a4a3a' : '#7a6a5a';
                        ctx.lineWidth = street.type === 'main' ? Math.max(2, viewport.zoom * 0.3) : Math.max(1, viewport.zoom * 0.15);

                        let first = true;
                        for (const point of street.points) {
                            const sx = canvasWidth / 2 + (point.worldX - viewport.centerX) * viewport.zoom;
                            const sy = canvasHeight / 2 - (point.worldY - viewport.centerY) * viewport.zoom;
                            if (first) {
                                ctx.moveTo(sx, sy);
                                first = false;
                            } else {
                                ctx.lineTo(sx, sy);
                            }
                        }
                        ctx.stroke();
                    }

                    // City boundary
                    ctx.beginPath();
                    ctx.arc(cityCenterX, cityCenterY, screenRadius, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(42, 26, 10, 0.2)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }

    function renderLabels(
        ctx: CanvasRenderingContext2D,
        chunk: Chunk,
        viewport: Viewport,
        canvasWidth: number,
        canvasHeight: number
    ) {
        for (const label of chunk.labels) {
            if (viewport.zoom < label.minZoom || viewport.zoom > label.maxZoom) continue;

            const screenX = canvasWidth / 2 + (label.worldX - viewport.centerX) * viewport.zoom;
            const screenY = canvasHeight / 2 - (label.worldY - viewport.centerY) * viewport.zoom;

            // Skip labels outside viewport
            if (screenX < -100 || screenX > canvasWidth + 100 ||
                screenY < -50 || screenY > canvasHeight + 50) continue;

            ctx.save();
            ctx.translate(screenX, screenY);
            if (label.rotation) ctx.rotate(label.rotation);

            // Scale font size with zoom
            const scaledFontSize = Math.max(8, Math.min(24, label.fontSize * Math.sqrt(viewport.zoom)));
            ctx.font = `${scaledFontSize}px Georgia, serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Text shadow for readability
            ctx.fillStyle = '#f4e4bc';
            ctx.fillText(label.text, 1, 1);
            ctx.fillText(label.text, -1, -1);
            ctx.fillText(label.text, 1, -1);
            ctx.fillText(label.text, -1, 1);

            // Main text
            ctx.fillStyle = '#2a1a0a';
            ctx.fillText(label.text, 0, 0);

            ctx.restore();
        }
    }

    function renderChunkPlaceholder(
        ctx: CanvasRenderingContext2D,
        coord: { chunkX: number; chunkY: number },
        viewport: Viewport,
        canvasWidth: number,
        canvasHeight: number
    ) {
        const chunkWorldX = coord.chunkX * CHUNK_SIZE;
        const chunkWorldY = coord.chunkY * CHUNK_SIZE;
        const chunkScreenSize = CHUNK_SIZE * viewport.zoom;

        const screenX = canvasWidth / 2 + (chunkWorldX - viewport.centerX) * viewport.zoom;
        const screenY = canvasHeight / 2 - (chunkWorldY + CHUNK_SIZE - viewport.centerY) * viewport.zoom;

        // Skip if chunk is entirely off screen
        if (screenX + chunkScreenSize < 0 || screenX > canvasWidth ||
            screenY + chunkScreenSize < 0 || screenY > canvasHeight) {
            return;
        }

        // Shimmer effect - pulsing opacity
        const shimmerValue = 0.08 + Math.sin(shimmerPhaseRef.current) * 0.04;
        ctx.fillStyle = `rgba(180, 160, 120, ${shimmerValue})`;
        ctx.fillRect(screenX, screenY, chunkScreenSize, chunkScreenSize);

        // Add subtle border
        ctx.strokeStyle = `rgba(160, 140, 100, ${shimmerValue * 2})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX, screenY, chunkScreenSize, chunkScreenSize);
    }

    const scheduleRender = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(() => {
            render();
            animationFrameRef.current = null;
        });
    }, [render]);

    const initCanvas = useCallback(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        canvas.width = Math.floor(rect.width);
        canvas.height = Math.floor(rect.height);

        render();
    }, [render]);

    // Pan handler
    const pan = useCallback((deltaX: number, deltaY: number) => {
        viewportRef.current = panViewport(viewportRef.current, deltaX, deltaY);
        scheduleRender();
    }, [scheduleRender]);

    // Zoom handler
    const zoom = useCallback((factor: number, screenX: number, screenY: number) => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const canvasX = screenX - rect.left;
        const canvasY = screenY - rect.top;

        viewportRef.current = zoomViewportAt(
            viewportRef.current,
            factor,
            canvasX,
            canvasY,
            rect.width,
            rect.height
        );
        scheduleRender();
    }, [scheduleRender]);

    // Mouse handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDraggingRef.current = true;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDraggingRef.current) return;

        const deltaX = e.clientX - lastMousePosRef.current.x;
        const deltaY = e.clientY - lastMousePosRef.current.y;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };

        pan(deltaX, deltaY);
    }, [pan]);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
    }, []);

    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
        zoom(factor, e.clientX, e.clientY);
    }, [zoom]);

    // Touch handlers
    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (e.touches.length === 1) {
            isDraggingRef.current = true;
            lastMousePosRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastTouchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
        }
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        e.preventDefault();

        if (e.touches.length === 1 && isDraggingRef.current) {
            const deltaX = e.touches[0].clientX - lastMousePosRef.current.x;
            const deltaY = e.touches[0].clientY - lastMousePosRef.current.y;
            lastMousePosRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            pan(deltaX, deltaY);
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (lastTouchDistanceRef.current > 0) {
                const factor = distance / lastTouchDistanceRef.current;
                const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                zoom(factor, centerX, centerY);
            }

            lastTouchDistanceRef.current = distance;
        }
    }, [pan, zoom]);

    const handleTouchEnd = useCallback(() => {
        isDraggingRef.current = false;
        lastTouchDistanceRef.current = 0;
    }, []);

    // Initialize on mount
    useEffect(() => {
        initCanvas();

        const handleResize = () => initCanvas();
        window.addEventListener('resize', handleResize);

        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
            container.addEventListener('touchstart', handleTouchStart, { passive: true });
            container.addEventListener('touchmove', handleTouchMove, { passive: false });
            container.addEventListener('touchend', handleTouchEnd, { passive: true });
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (container) {
                container.removeEventListener('wheel', handleWheel);
                container.removeEventListener('touchstart', handleTouchStart);
                container.removeEventListener('touchmove', handleTouchMove);
                container.removeEventListener('touchend', handleTouchEnd);
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (shimmerAnimationRef.current) {
                cancelAnimationFrame(shimmerAnimationRef.current);
            }
        };
    }, [initCanvas, handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

    // Re-render when seed changes
    useEffect(() => {
        chunksRef.current.clear();
        pendingChunksRef.current.clear();
        scheduleRender();
    }, [seed, scheduleRender]);

    const containerStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
        touchAction: 'none'
    };

    const canvasStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block'
    };

    return (
        <div
            ref={containerRef}
            style={containerStyle}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <canvas ref={canvasRef} style={canvasStyle} />
        </div>
    );
};

export default WorldCanvas;
