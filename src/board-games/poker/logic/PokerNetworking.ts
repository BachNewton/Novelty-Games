import io from 'socket.io-client';
import { wait } from '../../../util/Async';

const LOBBY_NAME = 'Novelty Games';

export interface PokerNetworking {
    connect: (username: string) => void;
    startGame: () => void;
    onGameBegun: (callback: () => void) => void;
}

let instance: PokerNetworking | null = null;

export function createPokerNetworking(): PokerNetworking {
    if (instance !== null) return instance;

    const socket = io('localhost:8080');

    let username = 'username';
    let gameBegunCallback = () => { };

    socket.onAny((eventName, args) => {
        console.log(`Received event: ${eventName}`, args);
    });

    socket.on('badJoin', async _ => {
        socket.emit('createRoom', {
            username: null,
            stacksize: 0,
            lobbyname: LOBBY_NAME,
            smallBlind: 1,
            bigBlind: 2,
            password: ''
        });

        await wait(1000);

        socket.emit('joinRoom', [
            LOBBY_NAME,
            username,
            1000
        ]);
    });

    socket.on('goodJoin', _ => {
        socket.emit('joinRoom', [
            LOBBY_NAME,
            username,
            1000
        ]);
    });

    socket.on('gameBegun', () => {
        gameBegunCallback();
    });

    socket.emit('test', 'Hello from PokerNetworking');

    instance = {
        connect: (name) => {
            username = name;

            socket.emit('joinAttempt', {
                username: username,
                stackSize: 1000,
                lobbyname: LOBBY_NAME,
                password: ''
            });
        },

        startGame: () => {
            socket.emit('startGame');
        },

        onGameBegun: callback => gameBegunCallback = callback
    };

    return instance;
}
