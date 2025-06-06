import { MusicDatabaseTables } from "../tools/music-player/logic/MusicDatabase";

export enum DatabaseNames {
    MUSIC = 'music'
}

interface DatabaseTables {
    [DatabaseNames.MUSIC]: MusicDatabaseTables;
}

interface DatabaseAddRequest {
    openDatabase: Promise<void>;
    add: Promise<void>[];
    transactionComplete: Promise<void>;
}

export interface Database<DatabaseName extends DatabaseNames> {
    add: <TableName extends keyof DatabaseTables[DatabaseName]>(
        tableName: TableName,
        ...data: DatabaseTables[DatabaseName][TableName][]
    ) => DatabaseAddRequest;

    add2: <TableName extends keyof DatabaseTables[DatabaseName]>(
        tableName: TableName,
        data: DatabaseTables[DatabaseName][TableName]
    ) => Promise<void>;

    get: <TableName extends keyof DatabaseTables[DatabaseName]>(
        tableName: TableName
    ) => Promise<DatabaseTables[DatabaseName][TableName][]>;

    delete: () => Promise<void>;
}

export function createDatabase<DatabaseName extends DatabaseNames>(
    databaseName: DatabaseName,
    databaseTable: DatabaseTables[DatabaseName]
): Database<DatabaseName> {
    const tableNames = Object.keys(databaseTable);

    const getObjectStore = async (tableName: string, writeAccess: boolean): Promise<IDBObjectStore> => {
        const db = await openDatabase(databaseName, tableNames);
        const transaction = db.transaction(tableName, writeAccess ? 'readwrite' : 'readonly');
        return transaction.objectStore(tableName);
    };

    return {
        add: (tableName, ...data) => {
            const objectStore = getObjectStore(tableName as string, true);

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
        add2: async (tableName, data) => {
            const objectStore = await getObjectStore(tableName as string, true);

            objectStore.add(data);

            return await new Promise(resolve => objectStore.transaction.oncomplete = () => resolve());
        },
        get: async (tableName) => {
            const objectStore = await getObjectStore(tableName as string, false);

            return new Promise(resolve => {
                objectStore.getAll().onsuccess = (e => {
                    const target = e.target as IDBRequest;
                    const data = target.result;

                    resolve(data);
                });
            });
        },
        delete: () => new Promise(resolve => {
            const deleteRequest = indexedDB.deleteDatabase(databaseName);

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
                db.createObjectStore(tableName, { autoIncrement: true });
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
