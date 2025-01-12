import io from 'socket.io-client';

const SERVER_URL = 'https://novelty-games.mooo.com/';

interface NetworkService<T> {
    setNetworkEventListener: (listener: (data: T) => void) => void;
    broadcast: (data: T) => void;
    store: (data: StorageData) => void;
}

export enum NetworkedApplication {
    MILLE_BORNES,
    MARBLE
}

interface ServerEvent<T> {
    application: NetworkedApplication;
    data: T;
}

interface StorageData {
    folderName: string;
    fileName: string;
    content: string;
}

export function createNetworkService<T>(appFilter: NetworkedApplication): NetworkService<T> {
    const socket = io(SERVER_URL);

    let eventListener: (data: T) => void = () => { };

    socket.on('broadcast', (event: ServerEvent<T>) => {
        if (event.application !== appFilter) return;

        eventListener(event.data);
    });

    return {
        setNetworkEventListener: listener => eventListener = listener,
        broadcast: data => socket.emit('broadcast', { application: appFilter, data: data } as ServerEvent<T>),
        store: data => socket.emit('store', data)
    };
}
