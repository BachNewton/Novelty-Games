
import { GameData } from '../data/GameData';
import { Card, toCard } from '../data/Card';
import { Player, toPlayer } from '../data/Player';
import { isLocalhost } from '../../../util/Localhost';

// Cloudflare Workers poker server (Durable Objects backend)
const PROD_SERVER = 'wss://novelty-poker.jane-sturdyhippo.workers.dev';
const DEV_SERVER = 'ws://localhost:8787';

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

    // Connect WebSocket with room name as query param
    const wsUrl = `${url}/?room=${encodeURIComponent(LOBBY_NAME)}`;
    const socket = new WebSocket(wsUrl);

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

    // Send a JSON message to the server
    const send = (type: string, data?: any) => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type, data }));
        }
    };

    // Wait for connection to be open, then send
    const sendWhenReady = (type: string, data?: any) => {
        if (socket.readyState === WebSocket.OPEN) {
            send(type, data);
        } else {
            socket.addEventListener('open', () => send(type, data), { once: true });
        }
    };

    // Handle incoming messages (dispatch by type)
    socket.addEventListener('message', (event: MessageEvent) => {
        let parsed: any;
        try {
            parsed = JSON.parse(event.data);
        } catch {
            console.warn('Received non-JSON message:', event.data);
            return;
        }

        const { type, data } = parsed;

        switch (type) {
            case 'badJoin': {
                // Room doesn't exist or name taken — try to create it then join
                send('createRoom', {
                    username: null,
                    stacksize: 0,
                    lobbyname: LOBBY_NAME,
                    smallBlind: 1,
                    bigBlind: 2,
                    password: ''
                });
                setTimeout(() => {
                    send('joinRoom', [LOBBY_NAME, username, STARTING_CHIPS]);
                }, 1000);
                break;
            }

            case 'goodJoin': {
                send('joinRoom', [LOBBY_NAME, username, STARTING_CHIPS]);
                break;
            }

            case 'gameBegun':
                callbacks.gameBegun();
                break;

            case 'roomUsers': {
                const users = data.users as string[];
                callbacks.roomUsers(users);
                break;
            }

            case 'roomPlayers': {
                // data is an array: [dealerIndex, ...playerObjects]
                const arr = Array.isArray(data) ? data : [];
                const players = arr.slice(1).map((p: any) => toPlayer(p)) as Player[];
                const player = players.find(p => p.name === username);

                if (player) {
                    const maxInPot = Math.max(...players.filter(p => p.lastAction !== 'Folded').map(p => p.inPot));
                    const toCall = maxInPot - player.inPot;

                    const gameData: GameData = {
                        player: player,
                        players: players,
                        toCall: toCall
                    };

                    callbacks.gameUpdate(gameData);
                }
                break;
            }

            case 'yourTurn':
                callbacks.yourTurn();
                break;

            case 'potSize':
                callbacks.potUpdate(data);
                break;

            case 'dealBoard':
                callbacks.dealBoard(data.map((c: any) => toCard(c)));
                break;

            case 'message':
                callbacks.message(data);
                break;

            case 'allIn':
                send('playerTurn', 'playerIsAllIn');
                break;

            case 'consoleLog':
                callbacks.message(data);
                break;

            case 'hands':
            case 'validOption':
                // Ignored - same as original
                break;

            default:
                console.log(`Unhandled event: ${type}`, data);
                break;
        }
    });

    socket.addEventListener('error', (event: Event) => {
        console.error('WebSocket error:', event);
    });

    socket.addEventListener('close', () => {
        console.log('WebSocket disconnected');
    });

    instance = {
        connect: (name) => {
            username = name;
            sendWhenReady('joinAttempt', {
                username: username,
                stackSize: STARTING_CHIPS,
                lobbyname: LOBBY_NAME,
                password: ''
            });
        },

        startGame: () => {
            send('startGame');
        },

        takeAction: (action) => {
            send('playerTurn', getActionValue(action));
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
