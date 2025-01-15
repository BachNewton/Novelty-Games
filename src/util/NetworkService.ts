import io from 'socket.io-client';

const SERVER_URL = 'https://novelty-games.mooo.com/';

interface NetworkService<T> {
    setNetworkEventListener: (listener: (data: T) => void) => void;
    broadcast: (data: T) => void;
    saveFile: (data: SaveFileData) => void;
}

export enum NetworkedApplication {
    MILLE_BORNES = 'mille-bornes',
    MARBLE = 'marble',
    FREE_MARKET = 'free-market'
}

interface ServerEvent<T> {
    application: NetworkedApplication;
    data: T;
}

interface SaveFileEvent {
    application: NetworkedApplication;
    data: SaveFileData;
}

interface SaveFileData {
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
        saveFile: data => socket.emit('saveFile', { application: appFilter, data: data } as SaveFileEvent)
    };
}
