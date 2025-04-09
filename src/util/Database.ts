import { MusicDatabaseTables } from "../tools/music-player/logic/MusicDatabase";
import { createNetworkService, NetworkedApplication } from "./NetworkService";

export enum DatabaseNames {
    MUSIC = 'music'
}

interface DatabaseTables {
    [DatabaseNames.MUSIC]: MusicDatabaseTables;
}

export interface Database<DatabaseName extends DatabaseNames> {
    add: <TableName extends keyof DatabaseTables[DatabaseName]>(
        tableName: TableName,
        ...data: DatabaseTables[DatabaseName][TableName][]
    ) => Promise<void>[];

    get: <TableName extends keyof DatabaseTables[DatabaseName]>(
        tableName: TableName
    ) => Promise<DatabaseTables[DatabaseName][TableName][]>;

    delete: () => Promise<void>;
}

const tempNetworkService = createNetworkService<void>(NetworkedApplication.DATABASE);

export function createDatabase<DatabaseName extends DatabaseNames>(
    databaseName: DatabaseName,
    databaseTable: DatabaseTables[DatabaseName]
): Database<DatabaseName> {
    const tableNames = Object.keys(databaseTable);

    const getObjectStore = async (tableName: string, writeAccess: boolean): Promise<IDBObjectStore> => {
        const db = await openDatabase(databaseName, tableNames);
        const transaction = db.transaction(tableName, writeAccess ? 'readwrite' : 'readonly');
        tempNetworkService.log(`Transaction ${writeAccess ? 'readwrite' : 'readonly'} on table named "${tableName}"`);
        return transaction.objectStore(tableName);
    };

    return {
        add: (tableName, ...data) => {
            const objectStore = getObjectStore(tableName as string, true);

            return data.map(async value => {
                const addRequest = (await objectStore).add(value);

                return await new Promise<void>(resolve => addRequest.onsuccess = () => resolve());
            });
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

            deleteRequest.onblocked = () => tempNetworkService.log(`Delete request - Database ${databaseName} is blocked!`);
            deleteRequest.onsuccess = () => resolve();
        })
    };
}

function openDatabase(databaseName: string, tableNames: string[]): Promise<IDBDatabase> {
    tempNetworkService.log(`Opening database ${databaseName}...`);

    return new Promise(resolve => {
        const request = indexedDB.open(databaseName);

        request.onblocked = () => tempNetworkService.log(`Database ${databaseName} is blocked!`);

        request.onupgradeneeded = e => {
            tempNetworkService.log(`Upgrading database ${databaseName}`);
            const db = getDatabase(e);

            for (const tableName of tableNames) {
                db.createObjectStore(tableName, { autoIncrement: true });
            }
        };

        request.onsuccess = e => {
            tempNetworkService.log(`Opened database success ${databaseName}`);
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
