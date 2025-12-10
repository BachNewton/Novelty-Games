import { FractalType } from '../data/FractalTypes';
import { TileRequest, TileResult } from '../data/WorkerProtocol';
import { ViewportState, getViewportBounds } from './ViewportState';
import { WorkerPool } from './WorkerPool';

export const TILE_SIZE = 128; // pixels

export interface Tile {
    id: string;
    x: number; // screen x position
    y: number; // screen y position
    width: number;
    height: number;
    imageData?: ImageData;
    workerId?: number; // which worker computed this tile
    isComputing: boolean;
}

interface RenderParams {
    fractalType: FractalType;
    maxIterations: number;
    paletteId: string;
    juliaReal?: number;
    juliaImag?: number;
}

export class TileManager {
    private tiles: Map<string, Tile> = new Map();
    private workerPool: WorkerPool;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private viewport: ViewportState;
    private renderParams: RenderParams;
    private onRenderComplete?: () => void;
    private isTerminated = false;

    constructor(
        canvas: HTMLCanvasElement,
        viewport: ViewportState,
        renderParams: RenderParams,
        onRenderComplete?: () => void
    ) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.viewport = viewport;
        this.renderParams = renderParams;
        this.onRenderComplete = onRenderComplete;

        this.workerPool = new WorkerPool((result) => this.onTileComplete(result));
    }

    private generateTileId(col: number, row: number, zoom: number): string {
        return `${col}_${row}_${zoom.toFixed(6)}`;
    }

    private onTileComplete(result: TileResult): void {
        if (this.isTerminated) return;

        const tile = this.tiles.get(result.tileId);
        if (!tile) return;

        // Create ImageData from the array
        const pixelData = new Uint8ClampedArray(result.imageData);
        tile.imageData = new ImageData(
            pixelData,
            result.tileWidth,
            result.tileHeight
        );
        tile.workerId = result.workerId;
        tile.isComputing = false;

        // Draw the tile immediately
        this.drawTile(tile);

        // Check if all tiles are done
        if (this.workerPool.getPendingCount() === 0) {
            this.onRenderComplete?.();
        }
    }

    private drawTile(tile: Tile): void {
        if (tile.imageData) {
            this.ctx.putImageData(tile.imageData, tile.x, tile.y);
        }
    }

    updateViewport(viewport: ViewportState): void {
        this.viewport = viewport;
    }

    updateRenderParams(params: Partial<RenderParams>): void {
        this.renderParams = { ...this.renderParams, ...params };
    }

    render(): void {
        // Check if terminated
        if (this.isTerminated) {
            return;
        }

        // Ensure workers are available
        if (this.workerPool.getWorkerCount() === 0) {
            console.warn('TileManager.render: No workers available');
            return;
        }

        // Clear previous tiles
        this.tiles.clear();
        this.workerPool.resetStats();

        const bounds = getViewportBounds(this.viewport);

        // Calculate tile grid
        const cols = Math.ceil(this.viewport.canvasWidth / TILE_SIZE);
        const rows = Math.ceil(this.viewport.canvasHeight / TILE_SIZE);

        // Calculate center tile for priority ordering
        const centerCol = cols / 2;
        const centerRow = rows / 2;

        // Create all tiles with distance from center for priority
        const tileRequests: { col: number; row: number; distance: number }[] = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const distance = Math.sqrt(
                    Math.pow(col - centerCol, 2) + Math.pow(row - centerRow, 2)
                );
                tileRequests.push({ col, row, distance });
            }
        }

        // Sort by distance from center (render center first)
        tileRequests.sort((a, b) => a.distance - b.distance);

        // Submit tiles to workers
        for (const { col, row } of tileRequests) {
            const tileX = col * TILE_SIZE;
            const tileY = row * TILE_SIZE;

            // Actual tile dimensions (may be smaller at edges) - must be integers
            const tileWidth = Math.floor(Math.min(TILE_SIZE, this.viewport.canvasWidth - tileX));
            const tileHeight = Math.floor(Math.min(TILE_SIZE, this.viewport.canvasHeight - tileY));

            if (tileWidth <= 0 || tileHeight <= 0) continue;

            // Calculate complex plane bounds for this tile
            const realRange = bounds.realMax - bounds.realMin;
            const imagRange = bounds.imagMax - bounds.imagMin;

            const realMin = bounds.realMin + (tileX / this.viewport.canvasWidth) * realRange;
            const realMax = bounds.realMin + ((tileX + tileWidth) / this.viewport.canvasWidth) * realRange;
            const imagMin = bounds.imagMin + (tileY / this.viewport.canvasHeight) * imagRange;
            const imagMax = bounds.imagMin + ((tileY + tileHeight) / this.viewport.canvasHeight) * imagRange;

            const tileId = this.generateTileId(col, row, this.viewport.zoom);

            const tile: Tile = {
                id: tileId,
                x: tileX,
                y: tileY,
                width: tileWidth,
                height: tileHeight,
                isComputing: true
            };

            this.tiles.set(tileId, tile);

            const request: TileRequest = {
                type: 'COMPUTE_TILE',
                tileId,
                tileX,
                tileY,
                tileWidth,
                tileHeight,
                realMin,
                realMax,
                imagMin,
                imagMax,
                fractalType: this.renderParams.fractalType,
                maxIterations: this.renderParams.maxIterations,
                paletteId: this.renderParams.paletteId,
                juliaReal: this.renderParams.juliaReal,
                juliaImag: this.renderParams.juliaImag
            };

            this.workerPool.submitTile(request);
        }
    }

    // Draw worker overlay showing which worker computed each tile
    drawWorkerOverlay(workerColors: string[]): void {
        this.ctx.save();

        for (const tile of this.tiles.values()) {
            if (tile.workerId !== undefined && tile.imageData) {
                const color = workerColors[tile.workerId % workerColors.length];

                // Semi-transparent fill
                this.ctx.fillStyle = color + '40';
                this.ctx.fillRect(tile.x, tile.y, tile.width, tile.height);

                // Border
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(tile.x + 1, tile.y + 1, tile.width - 2, tile.height - 2);

                // Worker number
                this.ctx.fillStyle = 'white';
                this.ctx.font = 'bold 12px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(
                    `W${tile.workerId}`,
                    tile.x + tile.width / 2,
                    tile.y + tile.height / 2
                );
            }
        }

        this.ctx.restore();
    }

    // Redraw all completed tiles (useful after clearing canvas)
    redrawTiles(): void {
        for (const tile of this.tiles.values()) {
            if (tile.imageData) {
                this.drawTile(tile);
            }
        }
    }

    getWorkerPool(): WorkerPool {
        return this.workerPool;
    }

    getTileCount(): number {
        return this.tiles.size;
    }

    getCompletedTileCount(): number {
        let count = 0;
        for (const tile of this.tiles.values()) {
            if (tile.imageData) count++;
        }
        return count;
    }

    terminate(): void {
        this.isTerminated = true;
        this.workerPool.terminate();
        this.tiles.clear();
    }
}
