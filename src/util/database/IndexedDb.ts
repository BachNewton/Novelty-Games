export interface IndexedDb {
    add: <T>(tableName: string, data: T) => Promise<void>;
    addAll: <T>(tableName: string, data: T[]) => Promise<void>;
    getAll: (tableName: string) => Promise<any[]>;
    deleteRow: (tableName: string, condition: (data: any) => boolean) => Promise<any>;
    delete: () => Promise<void>;
}

export function createIndexedDb(databaseName: string, tableNames: string[]): IndexedDb {
    return {
        add: (tableName, data) => addData(databaseName, tableNames, tableName, objectStore => objectStore.add(data)),

        addAll: (tableName, data) => addData(databaseName, tableNames, tableName, objectStore => data.forEach(value => objectStore.add(value))),

        getAll: async (tableName) => {
            const objectStore = await getObjectStore(databaseName, tableNames, tableName, false);

            return new Promise(resolve => {
                objectStore.getAll().onsuccess = (e => {
                    const target = e.target as IDBRequest;
                    const data = target.result;

                    resolve(data);
                });
            });
        },

        deleteRow: (tableName, condition) => new Promise(async (resolve, reject) => {
            const objectStore = await getObjectStore(databaseName, tableNames, tableName, true);
            const cursorRequest = objectStore.openCursor();

            let deletedValue: any;

            objectStore.transaction.oncomplete = () => resolve(deletedValue);

            cursorRequest.onsuccess = e => {
                const cursor = (e.target as IDBRequest<IDBCursorWithValue | null>).result;

                if (cursor === null) {
                    reject();
                } else if (condition(cursor.value)) {
                    deletedValue = cursor.value;
                    cursor.delete();
                } else {
                    cursor.continue();
                }
            };
        }),

        delete: () => new Promise(resolve => {
            const deleteRequest = indexedDB.deleteDatabase(databaseName);

            deleteRequest.onsuccess = () => resolve();
        })
    };
}

async function addData(
    databaseName: string,
    tableNames: string[],
    tableName: string,
    withObjectStore: (objectStore: IDBObjectStore) => void
) {
    const objectStore = await getObjectStore(databaseName, tableNames, tableName, true);

    withObjectStore(objectStore);

    return new Promise<void>(resolve => objectStore.transaction.oncomplete = () => resolve());
}

async function getObjectStore(
    databaseName: string,
    tableNames: string[],
    tableName: string,
    writeAccess: boolean
): Promise<IDBObjectStore> {
    const db = await openDatabase(databaseName, tableNames as string[]);
    const transaction = db.transaction(tableName as string, writeAccess ? 'readwrite' : 'readonly');
    return transaction.objectStore(tableName as string);
}

function openDatabase(databaseName: string, tableNames: string[]): Promise<IDBDatabase> {
    return new Promise(resolve => {
        const request = indexedDB.open(databaseName);

        request.onupgradeneeded = e => {
            const db = getDatabase(e);

            for (const tableName of tableNames) {
                if (db.objectStoreNames.contains(tableName)) continue;

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
