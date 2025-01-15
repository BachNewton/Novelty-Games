import io from 'socket.io-client';
import { createID } from './ID';

const SERVER_URL = 'https://novelty-games.mooo.com/';

interface NetworkService<T> {
    setNetworkEventListener: (listener: (data: T) => void) => void;
    broadcast: (data: T) => void;
    saveFile: (data: SaveFileData) => Promise<SaveFileResponse>;
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
    id: string;
    application: NetworkedApplication;
    data: SaveFileData;
}

interface SaveFileData {
    folderName: string;
    fileName: string;
    content: string;
}

export interface SaveFileResponse {
    id: string;
    isSuccessful: string;
}

export function createNetworkService<T>(appFilter: NetworkedApplication): NetworkService<T> {
    const socket = io(SERVER_URL);

    const requests: Map<string, (saveFileResponse: SaveFileResponse) => void> = new Map();

    let eventListener: (data: T) => void = () => { };

    socket.on('broadcast', (event: ServerEvent<T>) => {
        if (event.application !== appFilter) return;

        eventListener(event.data);
    });

    socket.on('saveFileResponse', (event: SaveFileResponse) => {
        requests.get(event.id)?.(event);
        requests.delete(event.id);
    });

    return {
        setNetworkEventListener: listener => eventListener = listener,
        broadcast: data => socket.emit('broadcast', { application: appFilter, data: data } as ServerEvent<T>),
        saveFile: data => {
            const id = createID();

            socket.emit('saveFile', { id: id, application: appFilter, data: data } as SaveFileEvent);

            return new Promise(resolve => requests.set(id, resolve));
        }
    };
}
