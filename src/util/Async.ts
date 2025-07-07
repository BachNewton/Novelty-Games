export function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function nullPromise<T>(): Promise<T | null> {
    return new Promise(resolve => resolve(null));
}
