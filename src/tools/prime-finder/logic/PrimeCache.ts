export interface PrimeCache {
    getPrimes: () => number[];
    getPrimesUpTo: (max: number) => number[];
    addPrimes: (newPrimes: number[]) => void;
    getCount: () => number;
    getLargest: () => number;
}

export function createPrimeCache(): PrimeCache {
    // Bootstrap with small primes for initial batches
    let primes: number[] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

    const binarySearchUpperBound = (arr: number[], target: number): number => {
        let left = 0;
        let right = arr.length;
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (arr[mid] <= target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return left;
    };

    const mergeSorted = (a: number[], b: number[]): number[] => {
        if (b.length === 0) return a;
        if (a.length === 0) return b;

        // Filter out any primes from b that are already in a
        const lastInA = a[a.length - 1];
        const newPrimes = b.filter(p => p > lastInA);

        if (newPrimes.length === 0) return a;

        // Since newPrimes are all larger than anything in a, just concat
        return [...a, ...newPrimes];
    };

    return {
        getPrimes: () => [...primes],

        getPrimesUpTo: (max) => {
            const idx = binarySearchUpperBound(primes, max);
            return primes.slice(0, idx);
        },

        addPrimes: (newPrimes) => {
            if (newPrimes.length === 0) return;
            const sorted = [...newPrimes].sort((a, b) => a - b);
            primes = mergeSorted(primes, sorted);
        },

        getCount: () => primes.length,

        getLargest: () => primes.length > 0 ? primes[primes.length - 1] : 0
    };
}
