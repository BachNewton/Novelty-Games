import io from 'socket.io-client';
import { wait } from '../../../util/Async';
import { GameData } from '../data/GameData';
import { Card, toCard } from '../data/Card';
import { Player, toPlayer } from '../data/Player';
import { isLocalhost } from '../../../util/Localhost';

const PROD_SERVER = 'https://novelty-games.mooo.com:8080';
const DEV_SERVER = 'localhost:8080';

const LOBBY_NAME = 'Novelty Games';
const STARTING_CHIPS = 100;

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
    onMessage: (callback: (message: string) => void) => void;
}

type Action = Check | Call | Fold | Raise;

interface Check { type: 'check' }
interface Call { type: 'call' }
interface Fold { type: 'fold' }
interface Raise { type: 'raise', amount: number }

let instance: PokerNetworking | null = null;

interface Callbacks {
    gameBegun: () => void;
    roomUsers: (users: string[]) => void;
    gameUpdate: (data: GameData) => void;
    yourTurn: () => void;
    potUpdate: (potSize: number) => void;
    dealBoard: (cards: Card[]) => void;
    message: (message: string) => void;
}

export function createPokerNetworking(): PokerNetworking {
    if (instance !== null) return instance;

    const url = isLocalhost() ? DEV_SERVER : PROD_SERVER;
    const socket = io(url);

    let username = 'username';

    const callbacks: Callbacks = {
        gameBegun: () => { },
        roomUsers: () => { },
        gameUpdate: () => { },
        yourTurn: () => { },
        potUpdate: () => { },
        dealBoard: () => { },
        message: () => { }
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
        if (eventName === 'message') return;
        if (eventName === 'allIn') return;
        if (eventName === 'consoleLog') return;
        if (eventName === 'hands') return;
        if (eventName === 'validOption') return;

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
            STARTING_CHIPS
        ]);
    });

    socket.on('goodJoin', _ => {
        socket.emit('joinRoom', [
            LOBBY_NAME,
            username,
            STARTING_CHIPS
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
        // const dealerIndex = data[0] as number;

        const players = data.splice(1).map((p: any) => toPlayer(p)) as Player[];
        const player = players.find(p => p.name === username)!;

        const maxInPot = Math.max(...players.map(p => p.inPot));
        const toCall = maxInPot - player.inPot;

        const gameData: GameData = {
            player: player,
            players: players,
            toCall: toCall
        };

        callbacks.gameUpdate(gameData);
    });

    socket.on('yourTurn', () => callbacks.yourTurn());

    socket.on('potSize', pot => callbacks.potUpdate(pot));

    socket.on('dealBoard', cards => callbacks.dealBoard(cards.map((c: any) => toCard(c))));

    socket.on('message', message => callbacks.message(message));

    socket.on('allIn', () => socket.emit('playerTurn', 'playerIsAllIn'));

    socket.on('consoleLog', text => callbacks.message(text));

    socket.on('hands', () => { /* Ignore */ });
    socket.on('validOption', () => { /* Ignore */ });

    instance = {
        connect: (name) => {
            username = name;

            socket.emit('joinAttempt', {
                username: username,
                stackSize: STARTING_CHIPS,
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
        onDealBoard: callback => callbacks.dealBoard = callback,
        onMessage: callback => callbacks.message = callback
    };

    return instance;
}

function getActionValue(action: Action): string | number {
    switch (action.type) {
        case 'check':
            return 'check';
        case 'call':
            return 'call';
        case 'fold':
            return 'fold'
        case 'raise':
            return action.amount;
    }
}
