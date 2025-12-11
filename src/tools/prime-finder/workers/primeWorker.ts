import { CoordinatorMessage, WorkerMessage, BatchResultMessage, ProgressMessage } from '../data/MessageTypes';

/* eslint-disable no-restricted-globals */
const ctx: Worker = self as unknown as Worker;

let workerId = -1;

function isPrime(n: number, knownPrimes: number[]): boolean {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;

    const sqrtN = Math.sqrt(n);

    // First check against known primes
    for (const prime of knownPrimes) {
        if (prime > sqrtN) break;
        if (n % prime === 0) return false;
    }

    // If knownPrimes doesn't cover sqrt(n), continue with odd numbers
    const lastKnown = knownPrimes.length > 0 ? knownPrimes[knownPrimes.length - 1] : 2;
    if (lastKnown < sqrtN) {
        let start = lastKnown + (lastKnown % 2 === 0 ? 1 : 2);
        for (let i = start; i <= sqrtN; i += 2) {
            if (n % i === 0) return false;
        }
    }

    return true;
}

function processBatch(batchStart: number, batchSize: number, knownPrimes: number[]): void {
    const startTime = performance.now();
    const foundPrimes: number[] = [];
    const batchEnd = batchStart + batchSize - 1;

    const progressInterval = Math.max(1000, Math.floor(batchSize / 10));

    for (let n = batchStart; n <= batchEnd; n++) {
        if (isPrime(n, knownPrimes)) {
            foundPrimes.push(n);
        }

        // Send progress updates periodically
        if ((n - batchStart) % progressInterval === 0 && n !== batchStart) {
            const progressMsg: ProgressMessage = {
                type: 'PROGRESS',
                workerId,
                currentNumber: n,
                primesFoundInBatch: foundPrimes.length
            };
            ctx.postMessage(progressMsg);
        }
    }

    const computeTimeMs = performance.now() - startTime;

    const resultMsg: BatchResultMessage = {
        type: 'BATCH_RESULT',
        workerId,
        foundPrimes,
        numbersChecked: batchSize,
        batchStart,
        batchEnd,
        computeTimeMs
    };

    ctx.postMessage(resultMsg);
}

ctx.onmessage = (event: MessageEvent<CoordinatorMessage>) => {
    const message = event.data;

    switch (message.type) {
        case 'INIT':
            workerId = message.workerId;
            const readyMsg: WorkerMessage = {
                type: 'READY',
                workerId
            };
            ctx.postMessage(readyMsg);
            break;

        case 'WORK_BATCH':
            processBatch(message.batchStart, message.batchSize, message.knownPrimes);
            break;

        case 'STOP':
            close();
            break;
    }
};
