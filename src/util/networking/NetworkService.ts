import { createID } from '../ID';
import { NetworkCommunicator } from './NetworkCommunicator';
import { createSocketIoCommunicator } from './SocketIoCommunicator';

export interface NetworkService<T> {
    setNetworkEventListener: (listener: (data: T) => void) => void;
    broadcast: (data: T) => void;
    saveFile: (data: SaveFileData) => Promise<SaveFileResponse>;
    getFile: (date: GetFileData) => Promise<GetFileResponse>;
    deleteFile: (data: DeleteFileData) => Promise<DeleteFileResponse>;
    log: (text: string) => void;
    downloadFile: (data: DownloadFileData) => Promise<DownloadFileResponse>;
}

export enum NetworkedApplication {
    MILLE_BORNES = 'mille-bornes',
    MARBLE = 'marble',
    FREE_MARKET = 'free-market',
    LABYRINTH = 'labyrinth',
    MUSIC_PLAYER = 'music-player'
}

interface BroadcastEvent<T> {
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

interface DownloadFileEvent {
    id: string;
    application: NetworkedApplication;
    data: DownloadFileData;
}

export interface DownloadFileData {
    id: string;
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

interface DownloadFileResponse {
    id: string;
    base64EncodedBuffer: string;
}

interface DeleteFileEvent {
    id: string;
    application: NetworkedApplication;
    data: DeleteFileData;
}

interface DeleteFileData {
    folderName: string;
    fileName: string;
}

export interface DeleteFileResponse {
    id: string;
    isSuccessful: boolean;
}

interface LogEvent {
    application: NetworkedApplication;
    text: string;
}

export function createNetworkService<T>(appFilter: NetworkedApplication): NetworkService<T> {
    const networkCommunicator: NetworkCommunicator = createSocketIoCommunicator();

    const saveFileRequests: Map<string, (saveFileResponse: SaveFileResponse) => void> = new Map();
    const getFileRequests: Map<string, (getFileResponse: GetFileResponse) => void> = new Map();
    const deleteFileRequests: Map<string, (deleteFileResponse: DeleteFileResponse) => void> = new Map();
    const downloadFileRequests: Map<string, (downloadFileResponse: DownloadFileResponse) => void> = new Map();

    let eventListener: (data: T) => void = () => { };

    networkCommunicator.receive('broadcast', (event: BroadcastEvent<T>) => {
        if (event.application !== appFilter) return;

        eventListener(event.data);
    });

    networkCommunicator.receive('saveFileResponse', (response: SaveFileResponse) => {
        saveFileRequests.get(response.id)?.(response);
        saveFileRequests.delete(response.id);
    });

    networkCommunicator.receive('getFileResponse', (response: GetFileResponse) => {
        getFileRequests.get(response.id)?.(response);
        getFileRequests.delete(response.id);
    });

    networkCommunicator.receive('downloadFileResponse', (response: DownloadFileResponse) => {
        downloadFileRequests.get(response.id)?.(response);
        downloadFileRequests.delete(response.id);
    });

    networkCommunicator.receive('deleteFileResponse', (response: DeleteFileResponse) => {
        deleteFileRequests.get(response.id)?.(response);
        deleteFileRequests.delete(response.id);
    });

    return {
        setNetworkEventListener: listener => eventListener = listener,
        broadcast: data => {
            const boradcastEvent: BroadcastEvent<T> = { application: appFilter, data: data };

            networkCommunicator.send('broadcast', boradcastEvent);
        },
        saveFile: data => {
            const id = createID();
            const saveFileEvent: SaveFileEvent = { id: id, application: appFilter, data: data };

            networkCommunicator.send('saveFile', saveFileEvent);

            return new Promise(resolve => saveFileRequests.set(id, resolve));
        },
        downloadFile: data => {
            const id = createID();
            const downloadFileEvent: DownloadFileEvent = { id: id, application: appFilter, data: data };

            networkCommunicator.send('downloadFile', downloadFileEvent);

            return new Promise(resolve => downloadFileRequests.set(id, resolve));
        },
        getFile: data => {
            const id = createID();
            const getFileEvent: GetFileEvent = { id: id, application: appFilter, data: data };

            networkCommunicator.send('getFile', getFileEvent);

            return new Promise(resolve => getFileRequests.set(id, resolve));
        },
        deleteFile: data => {
            const id = createID();
            const deleteFileEvent: DeleteFileEvent = { id: id, application: appFilter, data: data };

            networkCommunicator.send('deleteFile', deleteFileEvent);

            return new Promise(resolve => deleteFileRequests.set(id, resolve));
        },
        log: text => {
            const logEvent: LogEvent = { application: appFilter, text: text };

            networkCommunicator.send('log', logEvent);
        }
    };
}
