import io from 'socket.io-client';
import { wait } from '../../../util/Async';
import { GameData } from '../data/GameData';
import { Card, toCard } from '../data/Card';
import { toPlayer } from '../data/Player';

const LOBBY_NAME = 'Novelty Games';

export interface PokerNetworking {
    connect: (username: string) => void;
    startGame: () => void;
    takeAction: (action: Action) => void;
    onGameBegun: (callback: () => void) => void;
    onRoomUsers: (callback: (users: string[]) => void) => void;
    onGameUpdate: (callback: (data: GameData) => void) => void;
    onYourTurn: (callback: () => void) => void;
    onPotUpdate: (callback: (potSize: number) => void) => void;
    onDealBoard: (callback: (cards: Card[]) => void) => void;
}

type Action = Check | Call | Fold;

interface Check { type: 'check' }
interface Call { type: 'call' }
interface Fold { type: 'fold' }

let instance: PokerNetworking | null = null;

interface Callbacks {
    gameBegun: () => void;
    roomUsers: (users: string[]) => void;
    gameUpdate: (data: GameData) => void;
    yourTurn: () => void;
    potUpdate: (potSize: number) => void;
    dealBoard: (cards: Card[]) => void;
}

export function createPokerNetworking(): PokerNetworking {
    if (instance !== null) return instance;

    const socket = io('localhost:8080');

    let username = 'username';

    const callbacks: Callbacks = {
        gameBegun: () => { },
        roomUsers: () => { },
        gameUpdate: () => { },
        yourTurn: () => { },
        potUpdate: () => { },
        dealBoard: () => { }
    };

    socket.onAny((eventName, args) => {
        if (eventName === 'badJoin') return;
        if (eventName === 'goodJoin') return;
        if (eventName === 'gameBegun') return;
        if (eventName === 'roomUsers') return;
        if (eventName === 'roomPlayers') return;
        if (eventName === 'yourTurn') return;
        if (eventName === 'potSize') return;
        if (eventName === 'dealBoard') return;

        console.log(`Unhandled event: ${eventName}`, args);
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
        callbacks.gameBegun();
    });

    socket.on('roomUsers', data => {
        const users = data.users as string[];
        callbacks.roomUsers(users);
    });

    socket.on('roomPlayers', data => {
        const dealerIndex = data[0] as number;

        const players = data.splice(1);
        console.log('Players:', players);
        const player = players.find((p: any) => p.name === username);

        const gameData: GameData = {
            player: toPlayer(player),
            players: players.map((p: any) => toPlayer(p))
        };

        callbacks.gameUpdate(gameData);
    });

    socket.on('yourTurn', () => {
        callbacks.yourTurn();
    });

    socket.on('potSize', pot => callbacks.potUpdate(pot));

    socket.on('dealBoard', cards => callbacks.dealBoard(cards.map((c: any) => toCard(c))));

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

        takeAction: (action) => {
            socket.emit('playerTurn', getActionValue(action));
        },

        onGameBegun: callback => callbacks.gameBegun = callback,
        onRoomUsers: callback => callbacks.roomUsers = callback,
        onGameUpdate: callback => callbacks.gameUpdate = callback,
        onYourTurn: callback => callbacks.yourTurn = callback,
        onPotUpdate: callback => callbacks.potUpdate = callback,
        onDealBoard: callback => callbacks.dealBoard = callback
    };

    return instance;
}

function getActionValue(action: Action): string {
    switch (action.type) {
        case 'check':
            return 'check';
        case 'call':
            return 'call';
        case 'fold':
            return 'fold'
    }
}
