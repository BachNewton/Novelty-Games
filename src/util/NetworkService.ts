import io from 'socket.io-client';
import { createID } from './ID';

const SERVER_URL = 'https://novelty-games.mooo.com/';

interface NetworkService<T> {
    setNetworkEventListener: (listener: (data: T) => void) => void;
    broadcast: (data: T) => void;
    saveFile: (data: SaveFileData) => Promise<SaveFileResponse>;
    getFile: (date: GetFileData) => Promise<GetFileResponse>;
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
    isSuccessful: boolean;
}

interface GetFileEvent {
    id: string;
    application: NetworkedApplication;
    data: GetFileData;
}

interface GetFileData {
    folderName: string;
    fileName: string;
}

export interface GetFileResponse {
    id: string;
    isSuccessful: string;
    content: string | null;
}

export function createNetworkService<T>(appFilter: NetworkedApplication): NetworkService<T> {
    const socket = io(SERVER_URL);

    const saveFileRequests: Map<string, (saveFileResponse: SaveFileResponse) => void> = new Map();
    const getFileRequests: Map<string, (getFileResponse: GetFileResponse) => void> = new Map();

    let eventListener: (data: T) => void = () => { };

    socket.on('broadcast', (event: ServerEvent<T>) => {
        if (event.application !== appFilter) return;

        eventListener(event.data);
    });

    socket.on('saveFileResponse', (response: SaveFileResponse) => {
        saveFileRequests.get(response.id)?.(response);
        saveFileRequests.delete(response.id);
    });

    socket.on('getFileResponse', (response: GetFileResponse) => {
        getFileRequests.get(response.id)?.(response);
        getFileRequests.delete(response.id);
    });

    return {
        setNetworkEventListener: listener => eventListener = listener,
        broadcast: data => socket.emit('broadcast', { application: appFilter, data: data } as ServerEvent<T>),
        saveFile: data => {
            const id = createID();

            socket.emit('saveFile', { id: id, application: appFilter, data: data } as SaveFileEvent);

            return new Promise(resolve => saveFileRequests.set(id, resolve));
        },
        getFile: data => {
            const id = createID();

            socket.emit('getFile', { id: id, application: appFilter, data: data } as GetFileEvent);

            return new Promise(resolve => getFileRequests.set(id, resolve));
        }
    };
}
