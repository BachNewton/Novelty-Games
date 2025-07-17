import { IndexedDb } from "../IndexedDb";

export interface Table<Data> {
    add: (data: Data) => Promise<void>;
    getAll: () => Promise<Data[]>;
}

export function createTable<Data>(indexedDB: IndexedDb, tableName: string): Table<Data> {
    return {
        add: (data) => indexedDB.add(tableName, data),
        getAll: () => indexedDB.getAll(tableName)
    };
}
