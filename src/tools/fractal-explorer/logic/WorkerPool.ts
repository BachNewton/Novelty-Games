import { createFractalWorker } from './FractalWorker';
import { TileRequest, TileResult, WorkerInit } from '../data/WorkerProtocol';

export interface WorkerStats {
    id: number;
    tilesCompleted: number;
    totalComputeTimeMs: number;
    isWorking: boolean;
}

export class WorkerPool {
    private workers: Worker[] = [];
    private workerStats: WorkerStats[] = [];
    private pendingTiles: Map<string, number> = new Map(); // tileId -> workerId
    private onTileComplete: (result: TileResult) => void;
    private nextWorkerIndex = 0;

    constructor(onTileComplete: (result: TileResult) => void) {
        this.onTileComplete = onTileComplete;
        this.initializeWorkers();
    }

    private initializeWorkers() {
        // Use available CPU cores, but cap at 8 for reasonable performance
        const workerCount = Math.min(navigator.hardwareConcurrency || 4, 8);

        for (let i = 0; i < workerCount; i++) {
            try {
                const worker = createFractalWorker();

                // Handle errors
                worker.onerror = (e) => {
                    console.error(`Worker ${i} error:`, e.message, e);
                };

                // Handle results
                worker.onmessage = (e: MessageEvent<TileResult>) => {
                    const result = e.data;
                    this.pendingTiles.delete(result.tileId);

                    // Update stats
                    const stats = this.workerStats[result.workerId];
                    if (stats) {
                        stats.tilesCompleted++;
                        stats.totalComputeTimeMs += result.computeTimeMs;
                        stats.isWorking = false;
                    }

                    this.onTileComplete(result);
                };

                this.workers.push(worker);
                this.workerStats.push({
                    id: i,
                    tilesCompleted: 0,
                    totalComputeTimeMs: 0,
                    isWorking: false
                });

                // Initialize worker with its ID after adding to arrays
                const initMessage: WorkerInit = { type: 'INIT', workerId: i };
                worker.postMessage(initMessage);
            } catch (e) {
                console.error(`Failed to create worker ${i}:`, e);
            }
        }

        console.log(`Initialized ${this.workers.length} workers`);
    }

    submitTile(request: TileRequest): void {
        if (this.workers.length === 0) {
            console.error('No workers available');
            return;
        }

        // Round-robin distribution
        const workerId = this.nextWorkerIndex;
        this.nextWorkerIndex = (this.nextWorkerIndex + 1) % this.workers.length;

        const worker = this.workers[workerId];
        const stats = this.workerStats[workerId];

        if (!worker || !stats) {
            console.error('Worker or stats not found for id:', workerId);
            return;
        }

        this.pendingTiles.set(request.tileId, workerId);
        stats.isWorking = true;

        worker.postMessage(request);
    }

    getWorkerCount(): number {
        return this.workers.length;
    }

    getWorkerStats(): WorkerStats[] {
        return [...this.workerStats];
    }

    getPendingCount(): number {
        return this.pendingTiles.size;
    }

    resetStats(): void {
        for (const stats of this.workerStats) {
            stats.tilesCompleted = 0;
            stats.totalComputeTimeMs = 0;
        }
    }

    terminate(): void {
        for (const worker of this.workers) {
            worker.terminate();
        }
        this.workers = [];
        this.workerStats = [];
        this.pendingTiles.clear();
    }
}
