import io from 'socket.io-client';

export interface PokerNetworking { }

let instance: PokerNetworking | null = null;

export function createPokerNetworking(): PokerNetworking {
    if (instance !== null) return instance;

    const socket = io('localhost:8080');

    socket.onAny((eventName, args) => {
        console.log(`Received event: ${eventName}`, args);
    });

    socket.emit('test', 'Hello from PokerNetworking');

    instance = {};

    return instance;
}
