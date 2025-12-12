# Prime Finder Web Worker Architecture

This document explains the architecture and logic of the Prime Finder tool, focusing on how web workers are utilized for parallel prime number computation.

## Overview

The Prime Finder uses a coordinator-worker pattern to distribute prime number calculations across multiple CPU cores. A central coordinator manages work distribution while web workers perform the actual prime checking in parallel.

## File Structure

```
src/tools/prime-finder/
├── data/
│   └── MessageTypes.ts      # Type definitions for all messages
├── logic/
│   ├── PrimeCoordinator.ts  # Main orchestrator
│   └── PrimeCache.ts        # Prime number storage
├── workers/
│   └── primeWorker.ts       # Web worker implementation
└── ui/
    ├── Home.tsx             # React container component
    └── PrimeCanvas.tsx      # Real-time visualization
```

## Web Worker Creation and Lifecycle

### Worker Count

Workers are created based on available CPU cores:

```typescript
const workerCount = navigator.hardwareConcurrency || 4;
```

### Initialization Flow

1. **User clicks Start** - Creates a `PrimeCoordinator` instance
2. **Coordinator creates N workers** using the URL constructor pattern:
   ```typescript
   new Worker(new URL('../workers/primeWorker.ts', import.meta.url))
   ```
3. **Each worker receives an INIT message** with its assigned `workerId`
4. **Worker responds with READY** message
5. **Coordinator assigns first batch** to each ready worker

### Termination

When stopped, the coordinator:
1. Sends a `STOP` message to each worker
2. Calls `worker.terminate()` to clean up resources
3. Updates worker states to 'idle'

## Message Protocol

Communication uses typed messages via `postMessage()`.

### Coordinator → Worker Messages

| Message Type | Purpose | Data |
|--------------|---------|------|
| `INIT` | Initialize worker | `workerId` |
| `WORK_BATCH` | Assign work | `batchStart`, `batchSize`, `knownPrimes[]` |
| `STOP` | Shut down worker | - |

### Worker → Coordinator Messages

| Message Type | Purpose | Data |
|--------------|---------|------|
| `READY` | Worker initialized | `workerId` |
| `PROGRESS` | Mid-batch update | `workerId`, `currentNumber`, `primesFoundInBatch` |
| `BATCH_RESULT` | Batch complete | `workerId`, `foundPrimes[]`, `numbersChecked`, `computeTimeMs` |

### Message Flow Diagram

```
Coordinator                          Worker
    │                                  │
    │──── INIT (workerId: 0) ─────────▶│
    │                                  │
    │◀──────── READY ──────────────────│
    │                                  │
    │──── WORK_BATCH ─────────────────▶│
    │     [2, 10000]                   │
    │     knownPrimes: [2,3,5,7...]    │
    │                                  │ (processing...)
    │◀──────── PROGRESS ───────────────│
    │          currentNumber: 3000     │
    │                                  │
    │◀──────── PROGRESS ───────────────│
    │          currentNumber: 6000     │
    │                                  │
    │◀──────── BATCH_RESULT ───────────│
    │          foundPrimes: [...]      │
    │          computeTimeMs: 450      │
    │                                  │
    │──── WORK_BATCH ─────────────────▶│ (next batch assigned)
    │     [40001, 55000]               │
    ...
```

## Work Batching

### Batch Configuration

```typescript
const INITIAL_BATCH_SIZE = 10000;      // 10K numbers per batch initially
const MIN_BATCH_SIZE = 1000;           // Never smaller than 1K
const MAX_BATCH_SIZE = 100000;         // Never larger than 100K
const TARGET_BATCH_TIME_MS = 500;      // Target ~500ms per batch
```

### Dynamic Batch Sizing

Batch sizes adapt to each worker's performance. After each completed batch, the coordinator calculates a new size:

```typescript
const ratio = TARGET_BATCH_TIME_MS / lastBatchTimeMs;
const newSize = Math.floor(currentSize * ratio);
return Math.min(MAX_BATCH_SIZE, Math.max(MIN_BATCH_SIZE, newSize));
```

**Examples:**
- Worker completes batch in 250ms → batch doubles (faster worker, give more work)
- Worker completes batch in 1000ms → batch halves (slower worker, reduce load)
- Result: All workers target ~500ms batches regardless of their processing speed

### Batch Assignment

The coordinator maintains a global counter `nextNumberToAssign` starting at 2:

```typescript
const assignBatch = (workerId: number, lastBatchTimeMs: number) => {
    const batchSize = calculateBatchSize(workerId, lastBatchTimeMs);
    const batchStart = nextNumberToAssign;
    nextNumberToAssign += batchSize;

    // Get primes needed for trial division
    const sqrtBatchEnd = Math.ceil(Math.sqrt(batchStart + batchSize));
    const knownPrimes = primeCache.getPrimesUpTo(sqrtBatchEnd);

    worker.postMessage({
        type: 'WORK_BATCH',
        batchStart,
        batchSize,
        knownPrimes
    });
};
```

### Work Distribution Example

With 4 workers starting simultaneously:

```
Worker 0: [2 - 10,001]       → completes in 400ms → next: [40,002 - 52,502]
Worker 1: [10,002 - 20,001]  → completes in 500ms → next: [52,503 - 62,503]
Worker 2: [20,002 - 30,001]  → completes in 600ms → next: [62,504 - 70,837]
Worker 3: [30,002 - 40,001]  → completes in 450ms → next: [70,838 - 81,949]
```

Each worker independently receives new batches as they finish, ensuring all cores stay busy.

## Prime Calculation Algorithm

### Trial Division

The worker uses trial division optimized with known primes:

```typescript
function isPrime(n: number, knownPrimes: number[]): boolean {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;

    const sqrtN = Math.sqrt(n);

    // Check against known primes first (most efficient)
    for (const prime of knownPrimes) {
        if (prime > sqrtN) break;
        if (n % prime === 0) return false;
    }

    // Fallback: check remaining odd numbers if needed
    const lastKnown = knownPrimes[knownPrimes.length - 1] || 2;
    if (lastKnown < sqrtN) {
        for (let i = lastKnown + 1; i <= sqrtN; i += 2) {
            if (n % i === 0) return false;
        }
    }

    return true;
}
```

### Progress Updates

Workers send progress updates to keep the UI responsive:

```typescript
const progressInterval = Math.max(1000, Math.floor(batchSize / 10));

for (let n = batchStart; n <= batchEnd; n++) {
    if (isPrime(n, knownPrimes)) {
        foundPrimes.push(n);
    }

    // Update every ~10% of batch (minimum 1000 numbers)
    if ((n - batchStart) % progressInterval === 0) {
        ctx.postMessage({ type: 'PROGRESS', ... });
    }
}
```

## Prime Cache

The `PrimeCache` stores discovered primes for efficient trial division.

### Design Decisions

- **Bootstrap primes**: Starts with `[2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]`
- **Storage limit**: Only stores primes ≤ 2,000,000 (sufficient for numbers up to ~4 trillion via sqrt)
- **Lookup**: Binary search for O(log n) retrieval of primes up to a given value

```typescript
const MAX_STORED_PRIME = 2_000_000;

getPrimesUpTo: (max) => {
    const idx = binarySearchUpperBound(storedPrimes, max);
    return storedPrimes.slice(0, idx);
}

addPrimes: (newPrimes) => {
    totalCount += newPrimes.length;
    // Only store primes useful for trial division
    const primesToStore = newPrimes.filter(p => p <= MAX_STORED_PRIME);
    storedPrimes.push(...primesToStore);
}
```

### Why This Works

To check if `n` is prime, you only need to test divisibility by primes up to `√n`. By storing primes up to 2 million, the cache supports checking numbers up to 4 trillion (2,000,000² = 4×10¹²).

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Home.tsx                                │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │ dataRef      │  │ PrimeCoordinator │  │ PrimeCanvas      │   │
│  │ (shared)     │◀─│                  │  │ (reads dataRef)  │   │
│  └──────────────┘  └──────────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ Worker 0 │   │ Worker 1 │   │ Worker 2 │  ...
        └──────────┘   └──────────┘   └──────────┘
```

### Shared State (`PrimeFinderData`)

```typescript
interface PrimeFinderData {
    latestPrime: number;           // Most recent prime found
    totalPrimesFound: number;      // Running count
    highestNumberChecked: number;  // Progress indicator
    primesPerSecond: number;       // Rolling 5-sample average
    startTime: number;             // For elapsed time
    workerStates: WorkerStateInfo[];  // Per-worker stats
}
```

The canvas reads this data every animation frame for real-time visualization without blocking the main thread.

## Performance Characteristics

### Why This Architecture is Efficient

1. **Parallel Processing**: All CPU cores work simultaneously on different number ranges
2. **Minimal IPC Overhead**: Large batches (1K-100K numbers) minimize message passing
3. **Adaptive Load Balancing**: Faster workers get more work; slower workers get less
4. **Optimized Trial Division**: Uses cached primes instead of checking all numbers
5. **Non-blocking UI**: Workers run in separate threads; canvas reads shared refs

### Throughput Scaling

| Number Range | Approximate Rate |
|--------------|------------------|
| 1 - 10,000 | Millions/second |
| 1M - 1B | Thousands/second |
| 1T+ | Hundreds/second |

The rate decreases as numbers grow because:
- More trial divisions required (√n increases)
- Primes become less dense (Prime Number Theorem)

## Summary

The Prime Finder demonstrates effective use of web workers for CPU-intensive tasks:

- **Coordinator pattern** manages complexity of multi-worker orchestration
- **Dynamic batching** ensures all workers contribute effectively regardless of speed
- **Message-based communication** keeps workers isolated and thread-safe
- **Prime caching** optimizes the mathematical algorithm
- **Progress updates** maintain UI responsiveness without sacrificing throughput
