export enum StorageKey {
    PROFILE = 'PROFILE',
    MARBLE_AUTO_SAVE = 'MARBLE_AUTO_SAVE',
    MARBLE_QUICK_SAVE = 'MARBLE_QUICK_SAVE',
    FREE_MARKET = 'FREE_MARKET'
}

export interface Storer<T> {
    save(key: StorageKey, data: T): void;
    load(key: StorageKey): Promise<T>;
}

export function createStorer<T>(): Storer<T> {
    return {
        save: (key, data) => {
            localStorage.setItem(key, JSON.stringify(data));
        },
        load: (key) => new Promise((resolve, reject) => {
            const item = localStorage.getItem(key);

            if (item === null) {
                reject();
            } else {
                const data = JSON.parse(item) as T;

                resolve(data);
            }
        })
    };
};
