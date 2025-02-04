/**
 * @param array containing elements that should be shuffled
 * @returns a new array of elements from the provided array in a random order
 */
export function shuffleArray<T>(array: Array<T>): Array<T> {
    const remainingElements = [...array];
    const shuffledArray: Array<T> = [];

    while (remainingElements.length > 0) {
        const randomElement = removeRandomElement(remainingElements);
        shuffledArray.push(randomElement);
    }

    return shuffledArray;
}

export function removeRandomElement<T>(array: Array<T>): T {
    const randomIndex = getRandomIndex(array);
    return array.splice(randomIndex, 1)[0];
}

export function removeRandomElements<T>(array: Array<T>, count: number): T[] {
    return Array.from({ length: count }, () => removeRandomElement(array));
}

export function getRandomElement<T>(array: Array<T>): T {
    const randomIndex = getRandomIndex(array);
    return array[randomIndex];
}

export function randomNum(inclusiveMin: number, exclusiveMax: number): number {
    const range = exclusiveMax - inclusiveMin;
    return range * Math.random() + inclusiveMin;
}

export function randomInt(exclusiveMax: number): number {
    return Math.floor(Math.random() * exclusiveMax);
}

function getRandomIndex<T>(array: Array<T>): number {
    return randomInt(array.length);
}
