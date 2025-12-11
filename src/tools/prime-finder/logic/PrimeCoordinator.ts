import { CoordinatorMessage, WorkerMessage, WorkerStateInfo, PrimeStatistics } from '../data/MessageTypes';
import { createPrimeCache, PrimeCache } from './PrimeCache';

export interface PrimeCoordinatorCallbacks {
    onPrimesDiscovered: (primes: number[]) => void;
    onStatisticsUpdate: (stats: PrimeStatistics) => void;
    onWorkerStatesUpdate: (states: WorkerStateInfo[]) => void;
}

export interface PrimeCoordinator {
    start: () => void;
    stop: () => void;
    isRunning: () => boolean;
    getStatistics: () => PrimeStatistics;
    getWorkerStates: () => WorkerStateInfo[];
    getPrimeCache: () => PrimeCache;
}

const INITIAL_BATCH_SIZE = 10000;
const MIN_BATCH_SIZE = 1000;
const MAX_BATCH_SIZE = 100000;
const TARGET_BATCH_TIME_MS = 500;

export function createPrimeCoordinator(callbacks: PrimeCoordinatorCallbacks): PrimeCoordinator {
    const workerCount = navigator.hardwareConcurrency || 4;
    const workers: Worker[] = [];
    const workerStates: Map<number, WorkerStateInfo> = new Map();
    const workerBatchSizes: Map<number, number> = new Map();

    let running = false;
    let nextNumberToAssign = 2;
    let startTime = 0;
    let totalNumbersChecked = 0;
    let primesPerSecondSamples: number[] = [];
    let lastSampleTime = 0;
    let lastSamplePrimeCount = 0;

    const primeCache = createPrimeCache();

    const createWorkerState = (workerId: number): WorkerStateInfo => ({
        workerId,
        status: 'idle',
        currentBatchStart: 0,
        currentBatchEnd: 0,
        primesFoundTotal: 0,
        numbersCheckedTotal: 0,
        numbersPerSecond: 0,
        progress: 0
    });

    const calculateBatchSize = (workerId: number, lastBatchTimeMs: number): number => {
        const currentSize = workerBatchSizes.get(workerId) || INITIAL_BATCH_SIZE;

        if (lastBatchTimeMs <= 0) return currentSize;

        const ratio = TARGET_BATCH_TIME_MS / lastBatchTimeMs;
        const newSize = Math.floor(currentSize * ratio);

        return Math.min(MAX_BATCH_SIZE, Math.max(MIN_BATCH_SIZE, newSize));
    };

    const assignBatch = (workerId: number, lastBatchTimeMs: number = 0) => {
        const worker = workers[workerId];
        if (!worker || !running) return;

        const batchSize = calculateBatchSize(workerId, lastBatchTimeMs);
        workerBatchSizes.set(workerId, batchSize);

        const batchStart = nextNumberToAssign;
        nextNumberToAssign += batchSize;

        // Get primes needed for trial division (up to sqrt of batch end)
        const sqrtBatchEnd = Math.ceil(Math.sqrt(batchStart + batchSize));
        const knownPrimes = primeCache.getPrimesUpTo(sqrtBatchEnd);

        const state = workerStates.get(workerId);
        if (state) {
            state.status = 'working';
            state.currentBatchStart = batchStart;
            state.currentBatchEnd = batchStart + batchSize - 1;
            state.progress = 0;
        }

        const message: CoordinatorMessage = {
            type: 'WORK_BATCH',
            batchStart,
            batchSize,
            knownPrimes
        };

        worker.postMessage(message);
        notifyWorkerStatesUpdate();
    };

    const handleWorkerMessage = (workerId: number, message: WorkerMessage) => {
        if (!running && message.type !== 'READY') return;

        switch (message.type) {
            case 'READY':
                if (running) {
                    assignBatch(workerId);
                }
                break;

            case 'BATCH_RESULT': {
                const state = workerStates.get(workerId);
                if (state) {
                    state.primesFoundTotal += message.foundPrimes.length;
                    state.numbersCheckedTotal += message.numbersChecked;
                    state.numbersPerSecond = message.computeTimeMs > 0
                        ? Math.round((message.numbersChecked / message.computeTimeMs) * 1000)
                        : 0;
                    state.progress = 1;
                }

                totalNumbersChecked += message.numbersChecked;

                // Add discovered primes to cache
                if (message.foundPrimes.length > 0) {
                    primeCache.addPrimes(message.foundPrimes);
                    callbacks.onPrimesDiscovered(message.foundPrimes);
                }

                // Update statistics
                updateStatistics();

                // Assign next batch
                if (running) {
                    assignBatch(workerId, message.computeTimeMs);
                }
                break;
            }

            case 'PROGRESS': {
                const state = workerStates.get(workerId);
                if (state) {
                    const batchSize = state.currentBatchEnd - state.currentBatchStart + 1;
                    const processed = message.currentNumber - state.currentBatchStart;
                    state.progress = processed / batchSize;
                }
                notifyWorkerStatesUpdate();
                break;
            }
        }
    };

    const updateStatistics = () => {
        const now = performance.now();
        const elapsed = now - startTime;

        // Calculate rolling primes per second
        if (now - lastSampleTime >= 1000) {
            const currentCount = primeCache.getCount();
            const primesInInterval = currentCount - lastSamplePrimeCount;
            const intervalSeconds = (now - lastSampleTime) / 1000;
            const rate = primesInInterval / intervalSeconds;

            primesPerSecondSamples.push(rate);
            if (primesPerSecondSamples.length > 5) {
                primesPerSecondSamples.shift();
            }

            lastSampleTime = now;
            lastSamplePrimeCount = currentCount;
        }

        const avgPrimesPerSecond = primesPerSecondSamples.length > 0
            ? primesPerSecondSamples.reduce((a, b) => a + b, 0) / primesPerSecondSamples.length
            : 0;

        const stats: PrimeStatistics = {
            totalPrimesFound: primeCache.getCount(),
            largestPrime: primeCache.getLargest(),
            highestNumberChecked: nextNumberToAssign - 1,
            primesPerSecond: Math.round(avgPrimesPerSecond),
            elapsedTimeMs: elapsed,
            totalNumbersChecked
        };

        callbacks.onStatisticsUpdate(stats);
    };

    const notifyWorkerStatesUpdate = () => {
        callbacks.onWorkerStatesUpdate(Array.from(workerStates.values()));
    };

    const initializeWorkers = () => {
        for (let i = 0; i < workerCount; i++) {
            const worker = new Worker(
                new URL('../workers/primeWorker.ts', import.meta.url)
            );

            worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
                handleWorkerMessage(i, event.data);
            };

            worker.onerror = (error) => {
                console.error(`Worker ${i} error:`, error);
            };

            workers.push(worker);
            workerStates.set(i, createWorkerState(i));
            workerBatchSizes.set(i, INITIAL_BATCH_SIZE);

            // Initialize worker
            const initMessage: CoordinatorMessage = {
                type: 'INIT',
                workerId: i
            };
            worker.postMessage(initMessage);
        }

        notifyWorkerStatesUpdate();
    };

    const terminateWorkers = () => {
        workers.forEach((worker, i) => {
            const stopMessage: CoordinatorMessage = { type: 'STOP' };
            worker.postMessage(stopMessage);
            worker.terminate();

            const state = workerStates.get(i);
            if (state) {
                state.status = 'idle';
                state.progress = 0;
            }
        });

        workers.length = 0;
        notifyWorkerStatesUpdate();
    };

    return {
        start: () => {
            if (running) return;

            running = true;
            startTime = performance.now();
            lastSampleTime = startTime;
            lastSamplePrimeCount = primeCache.getCount();
            primesPerSecondSamples = [];

            initializeWorkers();
        },

        stop: () => {
            if (!running) return;

            running = false;
            terminateWorkers();
        },

        isRunning: () => running,

        getStatistics: () => ({
            totalPrimesFound: primeCache.getCount(),
            largestPrime: primeCache.getLargest(),
            highestNumberChecked: nextNumberToAssign - 1,
            primesPerSecond: primesPerSecondSamples.length > 0
                ? Math.round(primesPerSecondSamples.reduce((a, b) => a + b, 0) / primesPerSecondSamples.length)
                : 0,
            elapsedTimeMs: running ? performance.now() - startTime : 0,
            totalNumbersChecked
        }),

        getWorkerStates: () => Array.from(workerStates.values()),

        getPrimeCache: () => primeCache
    };
}
