import { DataType } from "./Data";

const DATABASE_POSTFIX = "_Database";
const OBJECT_STORE_POSTFIX = "_ObjectStore";
const KEY_PATH_POSTFIX = "_json";

export function get(dataType: DataType): Promise<any> {
    return new Promise((resolve, reject) => {
        const databaseName = getDatabaseName(dataType);
        const objectStoreName = getObjectStoreName(dataType);

        const request = indexedDB.open(databaseName);

        request.onupgradeneeded = (event) => {
            console.log('Creating the Database', databaseName);
            console.log('Creating ObjectStore', objectStoreName);
            const request = event.target as IDBOpenDBRequest
            request.result.createObjectStore(objectStoreName);
        };

        request.onsuccess = (event) => {
            const request = event.target as IDBOpenDBRequest
            const db = request.result;
            const transaction = db.transaction(objectStoreName, "readwrite");
            const objectStore = transaction.objectStore(objectStoreName);
            const getRequest = objectStore.get(getKeyPathName(dataType));
            getRequest.onsuccess = event => {
                const request = event.target as IDBRequest;
                const json = request.result;
                if (json === undefined) {
                    reject();
                } else {
                    resolve(json);
                }
            };
        };

        request.onerror = _ => {
            reject();
        };
    });
}

export function store(dataType: DataType, json: any) {
    const request = indexedDB.open(getDatabaseName(dataType));

    const objectStoreName = getObjectStoreName(dataType);

    request.onsuccess = (event) => {
        const request = event.target as IDBOpenDBRequest
        const db = request.result;
        const transaction = db.transaction(objectStoreName, "readwrite");
        const objectStore = transaction.objectStore(objectStoreName);
        objectStore.put(json, getKeyPathName(dataType)).onsuccess = _ => {
            console.log('Data stored in Database', dataType);
        };
    };
}

function getDatabaseName(dataType: DataType): string {
    return dataType + DATABASE_POSTFIX;
}

function getObjectStoreName(dataType: DataType): string {
    return dataType + OBJECT_STORE_POSTFIX;
}

function getKeyPathName(dataType: DataType): string {
    return dataType + KEY_PATH_POSTFIX;
}
