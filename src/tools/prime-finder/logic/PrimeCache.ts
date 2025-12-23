export interface PrimeCache {
    getPrimesUpTo: (max: number) => number[];
    addPrimes: (newPrimes: number[]) => void;
    getCount: () => number;
    getLargest: () => number;
    clear: () => void;
}

// Only store primes up to this value for trial division
// sqrt(10^12) ≈ 10^6, so 2M should cover numbers up to 4 trillion
const MAX_STORED_PRIME = 2_000_000;

export function createPrimeCache(): PrimeCache {
    // Bootstrap with small primes for initial batches
    let storedPrimes: number[] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    let totalCount = storedPrimes.length;
    let largestPrime = storedPrimes[storedPrimes.length - 1];

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

    return {
        getPrimesUpTo: (max) => {
            const idx = binarySearchUpperBound(storedPrimes, max);
            return storedPrimes.slice(0, idx);
        },

        addPrimes: (newPrimes) => {
            if (newPrimes.length === 0) return;

            // Update count and largest
            totalCount += newPrimes.length;
            const maxNew = Math.max(...newPrimes);
            if (maxNew > largestPrime) {
                largestPrime = maxNew;
            }

            // Only store primes up to MAX_STORED_PRIME for trial division
            const primesToStore = newPrimes.filter(p => p <= MAX_STORED_PRIME);
            if (primesToStore.length === 0) return;

            storedPrimes.push(...primesToStore);
        },

        getCount: () => totalCount,

        getLargest: () => largestPrime,

        clear: () => {
            storedPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
            totalCount = storedPrimes.length;
            largestPrime = storedPrimes[storedPrimes.length - 1];
        }
    };
}
