import { LobbyTeam } from "../ui/Lobby";
import io from 'socket.io-client';
import { Game } from "./Data";

export class LobbyEvent extends Event {
    static TYPE = 'LOBBY';

    lobbyTeams: Array<LobbyTeam>;

    constructor(lobbyTeams: Array<LobbyTeam>) {
        super(LobbyEvent.TYPE);

        this.lobbyTeams = lobbyTeams;
    }
}

export class GameEvent extends Event {
    static TYPE = 'GAME';

    game: Game;

    constructor(game: Game) {
        super(GameEvent.TYPE);

        this.game = game;
    }
}

interface ServerData {
    type: ServerDataType;
}

enum ServerDataType {
    LOBBY,
    GAME
}

interface LobbyServerData extends ServerData {
    lobbyTeams: Array<LobbyTeam>;
}

interface GameServerData extends ServerData {
    game: Game;
}

const SERVER_URL = 'http://35.184.159.91/';

export class Communicator extends EventTarget {
    private socket = io(window.location.hostname === 'localhost' ? 'http://localhost/' : SERVER_URL);

    constructor() {
        super();

        // this.socket.on('connect', () => {
        //     console.log(`You connected to the server with ID: ${this.socket.id}`);
        // });

        // this.socket.on('connection', (id: string) => {
        //     console.log(`ID: ${id} connected to the server`);
        // });

        // this.socket.on('disconnect', (id: string) => {
        //     console.log(`You disconnected from server with ID: ${this.socket.id}`);
        // });

        // this.socket.on('disconnected', (id: string) => {
        //     console.log(`ID: ${id} disconnected from the server`);
        // });

        this.socket.on('broadcast', (data: ServerData) => {
            console.log('Received data from server:', data);

            if (data.type === ServerDataType.LOBBY) {
                this.dispatchEvent(new LobbyEvent((data as LobbyServerData).lobbyTeams));
            } else if (data.type === ServerDataType.GAME) {
                this.dispatchEvent(new GameEvent((data as GameServerData).game));
            } else {
                throw new Error('Unsupported ServerData: ' + data);
            }
        });
    }

    updateLobby(lobbyTeams: Array<LobbyTeam>) {
        const data: LobbyServerData = {
            type: ServerDataType.LOBBY,
            lobbyTeams: lobbyTeams
        };

        this.broadcast(data);
    }

    startGame(game: Game) {
        const data: GameServerData = {
            type: ServerDataType.GAME,
            game: game
        };

        this.broadcast(data);
    }

    private broadcast(data: ServerData) {
        console.log('Sending data to server:', data);

        this.socket.emit('broadcast', data);
    }
}
