interface MusicDatabase {
    add: () => void;
}

export function createMusicDatabase(): MusicDatabase {
    return {
        add: add
    };
}

function add() {
    const request = indexedDB.open('music_database');

    request.onupgradeneeded = e => {
        console.log('onupgradeneeded');

        const db = getDatabase(e);

        const objectStore = db.createObjectStore('test', { autoIncrement: true });
    };

    request.onsuccess = e => {
        console.log('onsuccess', e);

        const db = getDatabase(e);
        const transaction = db.transaction('test', 'readwrite');
        const objectStore = transaction.objectStore('test');

        objectStore.add({
            a: '123',
            b: '456',
            file: '789'
        });
    };
}

function getDatabase(e: Event): IDBDatabase {
    const request = e.target as IDBOpenDBRequest
    const db = request.result;
    return db;
}
