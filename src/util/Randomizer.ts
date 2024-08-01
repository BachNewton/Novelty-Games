export function shuffleArray<T>(array: Array<T>): Array<T> {
    const remainingElements = [...array];
    const shuffledArray: Array<T> = [];

    while (remainingElements.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingElements.length);
        shuffledArray.push(remainingElements.splice(randomIndex, 1)[0]);
    }

    return shuffledArray;
}

export function removeRandomElement<T>(array: Array<T>): T {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array.splice(randomIndex, 1)[0];
}
