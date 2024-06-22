import { LobbyTeam } from "../ui/Lobby";
import io from 'socket.io-client';

export class LobbyUpdateEvent extends Event {
    static TYPE = 'LOBBY_UPDATE';

    lobbyTeams: Array<LobbyTeam>;

    constructor(lobbyTeams: Array<LobbyTeam>) {
        super(LobbyUpdateEvent.TYPE);

        this.lobbyTeams = lobbyTeams;
    }
}

interface ServerData {
    type: ServerDataType;
}

enum ServerDataType {
    LOBBY_UPDATE
}

interface LobbyUpdateServerData extends ServerData {
    lobbyTeams: Array<LobbyTeam>;
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
            if (data.type === ServerDataType.LOBBY_UPDATE) {
                this.dispatchEvent(new LobbyUpdateEvent((data as LobbyUpdateServerData).lobbyTeams));
            }
        });
    }

    updateLobby(lobbyTeams: Array<LobbyTeam>) {
        const data: LobbyUpdateServerData = {
            type: ServerDataType.LOBBY_UPDATE,
            lobbyTeams: lobbyTeams
        };

        this.broadcast(data);
    }

    private broadcast(data: ServerData) {
        this.socket.emit('broadcast', data);
    }
}
