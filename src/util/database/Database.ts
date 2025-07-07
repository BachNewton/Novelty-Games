import { DatabaseSchemas } from "./DatabaseSchemas";

export interface DatabaseAddRequest {
    openDatabase: Promise<void>;
    add: Promise<void>[];
    transactionComplete: Promise<void>;
}

export interface Database<Tables> {
    add: <T extends keyof Tables>(
        tableName: T,
        ...data: Tables[T][]
    ) => DatabaseAddRequest;

    get: <T extends keyof Tables>(
        tableName: T
    ) => Promise<Tables[T][]>;

    delete: () => Promise<void>;
}

export function createDatabase<Name extends keyof DatabaseSchemas>(
    databaseName: Name,
    tableNames: (keyof DatabaseSchemas[Name])[]
): Database<DatabaseSchemas[Name]> {
    const getObjectStore = async <T extends keyof DatabaseSchemas[Name]>(tableName: T, writeAccess: boolean): Promise<IDBObjectStore> => {
        const db = await openDatabase(databaseName, tableNames as string[]);
        const transaction = db.transaction(tableName as string, writeAccess ? 'readwrite' : 'readonly');
        return transaction.objectStore(tableName as string);
    };

    return {
        add: <T extends keyof DatabaseSchemas[Name]>(tableName: T, ...data: DatabaseSchemas[Name][T][]) => {
            const objectStore = getObjectStore(tableName, true);

            const addPromises = data.map(async value => {
                const addRequest = (await objectStore).add(value);
                return await new Promise<void>(resolve => addRequest.onsuccess = () => resolve());
            });

            return {
                openDatabase: objectStore.then(() => undefined),
                add: addPromises,
                transactionComplete: new Promise(async resolve => (await objectStore).transaction.oncomplete = () => resolve())
            };
        },
        get: async <T extends keyof DatabaseSchemas[Name]>(tableName: T) => {
            const objectStore = await getObjectStore(tableName, false);

            return new Promise<DatabaseSchemas[Name][T][]>(resolve => {
                objectStore.getAll().onsuccess = (e => {
                    const target = e.target as IDBRequest;
                    const data = target.result;
                    resolve(data);
                });
            });
        },
        delete: () => new Promise(resolve => {
            const deleteRequest = indexedDB.deleteDatabase(databaseName as string);
            deleteRequest.onsuccess = () => resolve();
        })
    };
}

function openDatabase(databaseName: string, tableNames: string[]): Promise<IDBDatabase> {
    return new Promise(resolve => {
        const request = indexedDB.open(databaseName);

        request.onupgradeneeded = e => {
            const db = getDatabase(e);

            for (const tableName of tableNames) {
                if (!db.objectStoreNames.contains(tableName)) {
                    db.createObjectStore(tableName, { autoIncrement: true });
                }
            }
        };

        request.onsuccess = e => {
            const db = getDatabase(e);

            resolve(db);
        };
    });
}

function getDatabase(e: Event): IDBDatabase {
    const request = e.target as IDBOpenDBRequest
    const db = request.result;

    db.addEventListener('versionchange', () => {
        console.log('Version change on:', db.name);
        db.close();
        console.log('Database closed:', db.name);
    });

    return db;
}
