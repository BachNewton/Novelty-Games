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

export function randomInt(exclusiveMax: number): number {
    return Math.floor(Math.random() * exclusiveMax);
}

function getRandomIndex<T>(array: Array<T>): number {
    return randomInt(array.length);
}
