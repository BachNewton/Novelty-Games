import io from 'socket.io-client';
import { wait } from '../../../util/Async';

export interface PokerNetworking { }

let instance: PokerNetworking | null = null;

export function createPokerNetworking(): PokerNetworking {
    if (instance !== null) return instance;

    const socket = io('localhost:8080');

    socket.onAny((eventName, args) => {
        console.log(`Received event: ${eventName}`, args);
    });

    socket.on('badJoin', async _ => {
        socket.emit('createRoom', {
            username: '',
            stacksize: 1000,
            lobbyname: 'Novelty Games',
            smallBind: 1,
            bigBlind: 2,
            password: ''
        });

        await wait(1000);

        socket.emit('joinRoom', [
            'Novelty Games',
            'Kyle',
            1000
        ]);
    });

    socket.on('goodJoin', data => {
        console.log('Successfully joined room:', data);
    });

    socket.emit('test', 'Hello from PokerNetworking');

    socket.emit('joinAttempt', {
        username: 'Kyle',
        stackSize: 1000,
        lobbyname: 'Novelty Games',
        password: ''
    });

    instance = {};

    return instance;
}
