export interface Database<Tables extends Record<string, any>> {
    add: <TableName extends keyof Tables>(tableName: TableName, data: Tables[TableName]) => void;
    get: <TableName extends keyof Tables>(tableName: TableName) => Promise<Tables[TableName][]>;
}

export function createDatabase<Tables extends Record<string, any>>(databaseName: string, tableNames: (keyof Tables)[]): Database<Tables> {
    const getObjectStore = async (tableName: string, writeAccess: boolean): Promise<IDBObjectStore> => {
        const db = await openDatabase(databaseName, tableNames);
        const transaction = db.transaction(tableName, writeAccess ? 'readwrite' : 'readonly');
        return transaction.objectStore(tableName);
    };

    return {
        add: async <TableName extends keyof Tables>(tableName: TableName, data: Tables[TableName]) => {
            const objectStore = await getObjectStore(tableName as string, true);

            objectStore.add(data);
        },
        get: async <TableName extends keyof Tables>(tableName: TableName): Promise<Tables[TableName][]> => {
            const objectStore = await getObjectStore(tableName as string, false);

            return new Promise(resolve => {
                objectStore.getAll().onsuccess = (e => {
                    const target = e.target as IDBRequest;
                    const data = target.result as Tables[TableName][];

                    resolve(data);
                });
            });
        }
    };
}

function openDatabase<Tables>(databaseName: string, tableNames: (keyof Tables)[]): Promise<IDBDatabase> {
    return new Promise(resolve => {
        const request = indexedDB.open(databaseName);

        request.onupgradeneeded = e => {
            const db = getDatabase(e);

            for (const tableName of tableNames) {
                db.createObjectStore(tableName as string, { autoIncrement: true });
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
    return db;
}
