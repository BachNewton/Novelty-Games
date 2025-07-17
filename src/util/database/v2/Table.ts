export interface Table<T> {
    add: (data: T) => Promise<void>;
    getAll: () => Promise<T[]>;
}

export function createTable<T>(databaseName: string, tableName: string): Table<T> {
    return {
        add: (data) => new Promise(() => { }),
        getAll: () => new Promise(() => { })
    };
}
