import { LobbyTeam } from "../ui/Lobby";
import io from 'socket.io-client';
import { Game, Team, createTeam } from "./Data";
import { Card, createCard } from "./Card";

const SERVER_URL = 'https://novelty-games.mooo.com/';

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

        game.deck = game.deck.map(card => createCard(card.image));
        game.teams = game.teams.map(team => createTeam(team));
        game.currentPlayer = game.teams[0].players[0];

        this.game = game;
    }
}

export class PlayCardEvent extends Event {
    static TYPE = 'PLAY_CARD';

    card: Card;
    targetTeamId: string | null;
    isExtentionCalled: boolean;

    constructor(card: Card, targetTeamId: string | null, isExtentionCalled: boolean) {
        super(PlayCardEvent.TYPE);

        this.card = createCard(card.image);
        this.targetTeamId = targetTeamId;
        this.isExtentionCalled = isExtentionCalled;
    }
}

interface ServerData {
    type: ServerDataType;
}

enum ServerDataType {
    LOBBY,
    GAME,
    PLAY_CARD
}

interface LobbyServerData extends ServerData {
    lobbyTeams: Array<LobbyTeam>;
}

interface GameServerData extends ServerData {
    game: Game;
}

interface PlayCardData extends ServerData {
    card: Card;
    targetTeamId: string | null;
    isExtentionCalled: boolean;
}

export class Communicator extends EventTarget {
    private socket = io(SERVER_URL);
    private existingEventListeners = new Map<string, EventListenerOrEventListenerObject>();

    constructor() {
        super();

        this.socket.on('broadcast', (data: ServerData) => {
            console.log('Received data from server:', data);

            if (data.type === ServerDataType.LOBBY) {
                this.dispatchEvent(new LobbyEvent((data as LobbyServerData).lobbyTeams));
            } else if (data.type === ServerDataType.GAME) {
                this.dispatchEvent(new GameEvent((data as GameServerData).game));
            } else if (data.type === ServerDataType.PLAY_CARD) {
                const playCardData = data as PlayCardData;
                this.dispatchEvent(new PlayCardEvent(playCardData.card, playCardData.targetTeamId, playCardData.isExtentionCalled));
            } else {
                throw new Error('Unsupported ServerData: ' + data);
            }
        });
    }

    override addEventListener(type: string, callback: EventListenerOrEventListenerObject) {
        const existingCallback = this.existingEventListeners.get(type);

        if (existingCallback !== undefined) {
            super.removeEventListener(type, existingCallback);
        }

        this.existingEventListeners.set(type, callback);

        super.addEventListener(type, callback);
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

    playCard(card: Card, targetTeam: Team | null, isExtentionCalled: boolean = false) {
        const data: PlayCardData = {
            type: ServerDataType.PLAY_CARD,
            card: card,
            targetTeamId: targetTeam === null ? null : targetTeam.id,
            isExtentionCalled: isExtentionCalled
        };

        this.broadcast(data);
    }

    private broadcast(data: ServerData) {
        console.log('Sending data to server:', data);

        this.socket.emit('broadcast', data);
    }
}
