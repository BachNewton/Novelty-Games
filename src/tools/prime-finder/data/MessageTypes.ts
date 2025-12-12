// Messages from Coordinator to Worker
export type CoordinatorMessage =
    | InitMessage
    | WorkBatchMessage
    | StopMessage;

export interface InitMessage {
    type: 'INIT';
    workerId: number;
}

export interface WorkBatchMessage {
    type: 'WORK_BATCH';
    batchStart: number;
    batchSize: number;
    knownPrimes: number[];
}

export interface StopMessage {
    type: 'STOP';
}

// Messages from Worker to Coordinator
export type WorkerMessage =
    | ReadyMessage
    | BatchResultMessage
    | ProgressMessage;

export interface ReadyMessage {
    type: 'READY';
    workerId: number;
}

export interface BatchResultMessage {
    type: 'BATCH_RESULT';
    workerId: number;
    foundPrimes: number[];
    numbersChecked: number;
    batchStart: number;
    batchEnd: number;
    computeTimeMs: number;
}

export interface ProgressMessage {
    type: 'PROGRESS';
    workerId: number;
    currentNumber: number;
    primesFoundInBatch: number;
}

// Shared state types
export interface WorkerStateInfo {
    workerId: number;
    status: 'idle' | 'working';
    currentBatchStart: number;
    currentBatchEnd: number;
    primesFoundTotal: number;
    numbersCheckedTotal: number;
    numbersPerSecond: number;
    progress: number;
}

export interface PrimeStatistics {
    totalPrimesFound: number;
    largestPrime: number;
    highestNumberChecked: number;
    primesPerSecond: number;
    elapsedTimeMs: number;
    totalNumbersChecked: number;
}

// Unified data structure for canvas rendering - updated by coordinator, read by canvas
export interface PrimeFinderData {
    latestPrime: number;
    totalPrimesFound: number;
    highestNumberChecked: number;
    primesPerSecond: number;
    startTime: number;
    workerStates: WorkerStateInfo[];
}
