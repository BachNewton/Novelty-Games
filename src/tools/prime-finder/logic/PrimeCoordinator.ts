import { CoordinatorMessage, WorkerMessage, PrimeFinderData } from '../data/MessageTypes';
import { createPrimeCache } from './PrimeCache';
import { MutableRefObject } from 'react';

export interface PrimeCoordinator {
    start: () => void;
    stop: () => void;
    isRunning: () => boolean;
}

const INITIAL_BATCH_SIZE = 10000;
const MIN_BATCH_SIZE = 1000;
const MAX_BATCH_SIZE = 100000;
const TARGET_BATCH_TIME_MS = 500;

export function createPrimeCoordinator(dataRef: MutableRefObject<PrimeFinderData>): PrimeCoordinator {
    const workerCount = navigator.hardwareConcurrency || 4;
    const workers: Worker[] = [];
    const workerBatchSizes: Map<number, number> = new Map();

    let running = false;
    let nextNumberToAssign = 2;
    let primesPerSecondSamples: number[] = [];
    let lastSampleTime = 0;
    let lastSamplePrimeCount = 0;

    const primeCache = createPrimeCache();

    // Initialize worker states in the data ref
    const initWorkerStates = () => {
        dataRef.current.workerStates = [];
        for (let i = 0; i < workerCount; i++) {
            dataRef.current.workerStates.push({
                workerId: i,
                status: 'idle',
                currentBatchStart: 0,
                currentBatchEnd: 0,
                primesFoundTotal: 0,
                numbersCheckedTotal: 0,
                numbersPerSecond: 0,
                progress: 0
            });
        }
    };

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

        // Update worker state directly in ref
        const state = dataRef.current.workerStates[workerId];
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
                const state = dataRef.current.workerStates[workerId];
                if (state) {
                    state.primesFoundTotal += message.foundPrimes.length;
                    state.numbersCheckedTotal += message.numbersChecked;
                    state.numbersPerSecond = message.computeTimeMs > 0
                        ? Math.round((message.numbersChecked / message.computeTimeMs) * 1000)
                        : 0;
                    state.progress = 1;
                }

                // Add discovered primes to cache and update data ref
                if (message.foundPrimes.length > 0) {
                    primeCache.addPrimes(message.foundPrimes);
                    dataRef.current.latestPrime = primeCache.getLargest();
                    dataRef.current.totalPrimesFound = primeCache.getCount();
                }

                dataRef.current.highestNumberChecked = nextNumberToAssign - 1;

                // Update primes per second
                updatePrimesPerSecond();

                // Assign next batch
                if (running) {
                    assignBatch(workerId, message.computeTimeMs);
                }
                break;
            }

            case 'PROGRESS': {
                const state = dataRef.current.workerStates[workerId];
                if (state) {
                    const batchSize = state.currentBatchEnd - state.currentBatchStart + 1;
                    const processed = message.currentNumber - state.currentBatchStart;
                    state.progress = processed / batchSize;
                }
                break;
            }
        }
    };

    const updatePrimesPerSecond = () => {
        const now = performance.now();

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

            // Update the ref
            dataRef.current.primesPerSecond = primesPerSecondSamples.length > 0
                ? Math.round(primesPerSecondSamples.reduce((a, b) => a + b, 0) / primesPerSecondSamples.length)
                : 0;
        }
    };

    const initializeWorkers = () => {
        initWorkerStates();

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
            workerBatchSizes.set(i, INITIAL_BATCH_SIZE);

            // Initialize worker
            const initMessage: CoordinatorMessage = {
                type: 'INIT',
                workerId: i
            };
            worker.postMessage(initMessage);
        }
    };

    const terminateWorkers = () => {
        workers.forEach((worker, i) => {
            const stopMessage: CoordinatorMessage = { type: 'STOP' };
            worker.postMessage(stopMessage);
            worker.terminate();

            const state = dataRef.current.workerStates[i];
            if (state) {
                state.status = 'idle';
                state.progress = 0;
            }
        });

        workers.length = 0;
    };

    return {
        start: () => {
            if (running) return;

            running = true;
            dataRef.current.startTime = performance.now();
            lastSampleTime = dataRef.current.startTime;
            lastSamplePrimeCount = primeCache.getCount();
            primesPerSecondSamples = [];

            // Reset data
            dataRef.current.latestPrime = primeCache.getLargest();
            dataRef.current.totalPrimesFound = primeCache.getCount();
            dataRef.current.highestNumberChecked = 0;
            dataRef.current.primesPerSecond = 0;

            initializeWorkers();
        },

        stop: () => {
            if (!running) return;

            running = false;
            terminateWorkers();
        },

        isRunning: () => running
    };
}
