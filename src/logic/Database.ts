import { DataType } from "./Data";

const DATABASE_POSTFIX = "_Database";
const OBJECT_STORE_POSTFIX = "_ObjectStore";
const KEY_PATH_POSTFIX = "_json";

export function get(dataType: DataType): Promise<Array<any>> {
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
            const getAllRequest = objectStore.getAll();
            getAllRequest.onsuccess = event => {
                const request = event.target as IDBRequest;
                const jsons = request.result;
                if (jsons === undefined || jsons.length === 0) {
                    reject();
                } else {
                    resolve(jsons);
                }
            }
        };

        request.onerror = _ => {
            reject();
        };
    });
}

export function store(dataType: DataType, jsons: Array<any>) {
    const request = indexedDB.open(getDatabaseName(dataType));

    const objectStoreName = getObjectStoreName(dataType);

    request.onsuccess = (event) => {
        const request = event.target as IDBOpenDBRequest
        const db = request.result;
        const transaction = db.transaction(objectStoreName, "readwrite");
        const objectStore = transaction.objectStore(objectStoreName);
        jsons.forEach((json, index) => {
            objectStore.put(json, getKeyPathName(dataType, index)).onsuccess = _ => {
                console.log('Data stored in Database', dataType, `element ${index + 1} of ${jsons.length}`);
            };
        });
    };
}

function getDatabaseName(dataType: DataType): string {
    return dataType + DATABASE_POSTFIX;
}

function getObjectStoreName(dataType: DataType): string {
    return dataType + OBJECT_STORE_POSTFIX;
}

function getKeyPathName(dataType: DataType, index: number): string {
    return dataType + KEY_PATH_POSTFIX + '_' + index;
}
