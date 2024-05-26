const RCDB_NAME = "RollerCoasterDatabase";
const RCDB_OBJ_STORE_NAME = "coasters";
const RCDB_KEY_PATH = "coasters_json";

export function get(): Promise<any> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(RCDB_NAME);

        request.onupgradeneeded = (event) => {
            console.log('Creating the Database');
            const request = event.target as IDBOpenDBRequest
            request.result.createObjectStore(RCDB_OBJ_STORE_NAME);
        };

        request.onsuccess = (event) => {
            const request = event.target as IDBOpenDBRequest
            const db = request.result;
            const transaction = db.transaction(RCDB_OBJ_STORE_NAME, "readwrite");
            const objectStore = transaction.objectStore(RCDB_OBJ_STORE_NAME);
            const getRequest = objectStore.get(RCDB_KEY_PATH);
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

export function store(json: any) {
    const request = indexedDB.open(RCDB_NAME);

    request.onsuccess = (event) => {
        const request = event.target as IDBOpenDBRequest
        const db = request.result;
        const transaction = db.transaction(RCDB_OBJ_STORE_NAME, "readwrite");
        const objectStore = transaction.objectStore(RCDB_OBJ_STORE_NAME);
        objectStore.put(json, RCDB_KEY_PATH).onsuccess = _ => {
            console.log('Data stored in Database');
        };
    };
}
