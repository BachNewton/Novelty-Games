export function shuffleArray<T>(array: Array<T>): Array<T> {
    const remainingElements = [...array];
    const shuffledArray: Array<T> = [];

    while (remainingElements.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingElements.length);
        shuffledArray.push(remainingElements.splice(randomIndex, 1)[0]);
    }

    return shuffledArray;
}
