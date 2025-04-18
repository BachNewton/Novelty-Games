import io from 'socket.io-client';
import { NetworkCommunicator } from "./NetworkCommunicator";

const SERVER_URL = 'https://novelty-games.mooo.com/';

export function createSocketIoCommunicator(): NetworkCommunicator {
    const socket = io(SERVER_URL);
    const callbacks: { [key: string]: (data: any) => void } = {};

    socket.onAny((eventName, args) => callbacks[eventName]?.(args));

    return {
        send: (eventName, data) => socket.emit(eventName, data),
        receive: (eventName, callback) => callbacks[eventName] = callback
    };
}
