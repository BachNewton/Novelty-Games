import { createNetworkService, NetworkedApplication, NetworkService } from "../../../util/NetworkService";
import { Game } from "../data/Game";
import { Lobby } from "../data/Lobby";
import { convertToGame, convertToNetworkGame, NetworkGame } from "../data/Network";

const LOBBY_FILE_NAME = 'lobby.json';
const GAME_FILE_NAME = 'game.json';

export interface LabyrinthCommunicator {
    setLobbyUpdateListener(listener: (lobby: Lobby) => void): void;
    createLobby: (lobby: Lobby) => void;
    getLobby: () => Promise<Lobby | null>;
    createGame: (game: Game) => void;
    getGame: () => Promise<Game | null>;
}

enum NetworkDataType {
    LOBBY_UPDATE, GAME_UPDATE
}

interface LabyrinthNetworkData {
    type: NetworkDataType;
}

interface LobbyUpdateNetworkEvent extends LabyrinthNetworkData { }

interface GameUpdateNetworkEvent extends LabyrinthNetworkData { }

export function createLabyrinthCommunicator(): LabyrinthCommunicator {
    const networkService = createNetworkService<LabyrinthNetworkData>(NetworkedApplication.LABYRINTH);

    let lobbyUpdateListener: (lobby: Lobby) => void = () => { };

    networkService.setNetworkEventListener(data => {
        if (isLobbyUpdateNetworkEvent(data)) {
            getLobby(networkService).then(lobby => {
                if (lobby === null) return;

                lobbyUpdateListener(lobby);
            });
        }
    });

    return {
        createLobby: (lobby) => networkService.saveFile({
            fileName: LOBBY_FILE_NAME,
            folderName: '',
            content: JSON.stringify(lobby)
        }).then(() => networkService.broadcast({
            type: NetworkDataType.LOBBY_UPDATE
        })),
        getLobby: () => getLobby(networkService),
        setLobbyUpdateListener: (listener) => lobbyUpdateListener = listener,
        createGame: (game) => networkService.saveFile({
            fileName: GAME_FILE_NAME, folderName: '', content: JSON.stringify(convertToNetworkGame(game))
        }).then(() => networkService.broadcast({
            type: NetworkDataType.GAME_UPDATE
        })),
        getGame: () => getGame(networkService)
    };
}

async function getLobby(networkService: NetworkService<LabyrinthNetworkData>): Promise<Lobby | null> {
    const response = await networkService.getFile({
        fileName: LOBBY_FILE_NAME,
        folderName: ''
    });

    return response.isSuccessful ? JSON.parse(response.content!) : null;
}

async function getGame(networkService: NetworkService<LabyrinthNetworkData>): Promise<Game | null> {
    const response = await networkService.getFile({
        fileName: GAME_FILE_NAME,
        folderName: ''
    });

    if (!response.isSuccessful) return null;

    const networkGame: NetworkGame = JSON.parse(response.content!);

    return convertToGame(networkGame);
}

function isLobbyUpdateNetworkEvent(data: LabyrinthNetworkData): data is LobbyUpdateNetworkEvent {
    return data.type === NetworkDataType.LOBBY_UPDATE;
}
