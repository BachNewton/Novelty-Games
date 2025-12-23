import { Chunk, getChunkKey } from '../data/ChunkTypes';

export interface ChunkWorkerClient {
    requestChunk: (chunkX: number, chunkY: number) => void;
    onChunkReady: (callback: (chunk: Chunk) => void) => void;
    isPending: (chunkX: number, chunkY: number) => boolean;
    terminate: () => void;
    updateSeed: (seed: number) => void;
}

export function createChunkWorkerClient(seed: number): ChunkWorkerClient {
    const worker = new Worker(
        new URL('./ChunkWorker.ts', import.meta.url),
        { type: 'module' }
    );

    let currentSeed = seed;
    const pendingChunks = new Set<string>();
    const callbacks: ((chunk: Chunk) => void)[] = [];

    // Initialize the worker with the seed
    worker.postMessage({ type: 'init', seed });

    worker.onmessage = (e: MessageEvent) => {
        const message = e.data;

        if (message.type === 'chunk') {
            const key = getChunkKey({ chunkX: message.chunkX, chunkY: message.chunkY });
            pendingChunks.delete(key);

            const chunk = message.chunk as Chunk;
            for (const callback of callbacks) {
                callback(chunk);
            }
        }
    };

    worker.onerror = (e) => {
        console.error('ChunkWorker error:', e);
    };

    return {
        requestChunk: (chunkX: number, chunkY: number) => {
            const key = getChunkKey({ chunkX, chunkY });
            if (pendingChunks.has(key)) {
                return; // Already pending
            }

            pendingChunks.add(key);
            worker.postMessage({
                type: 'generate',
                chunkX,
                chunkY,
                seed: currentSeed
            });
        },

        onChunkReady: (callback: (chunk: Chunk) => void) => {
            callbacks.push(callback);
        },

        isPending: (chunkX: number, chunkY: number) => {
            const key = getChunkKey({ chunkX, chunkY });
            return pendingChunks.has(key);
        },

        terminate: () => {
            worker.terminate();
            pendingChunks.clear();
            callbacks.length = 0;
        },

        updateSeed: (newSeed: number) => {
            if (newSeed !== currentSeed) {
                currentSeed = newSeed;
                pendingChunks.clear();
                worker.postMessage({ type: 'init', seed: newSeed });
            }
        }
    };
}
