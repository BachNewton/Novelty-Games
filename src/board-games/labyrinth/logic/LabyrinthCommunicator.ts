import { createNetworkService, NetworkedApplication, NetworkService } from "../../../util/networking/NetworkService";
import { Game } from "../data/Game";
import { Lobby } from "../data/Lobby";
import { convertToGame, convertToNetworkGame, NetworkGame } from "../data/Network";

const LOBBY_FILE_NAME = 'lobby.json';
const GAME_FILE_NAME = 'game.json';

export interface LabyrinthCommunicator {
    setLobbyUpdateListener(listener: (lobby: Lobby) => void): void;
    setGameUpdateListener(listener: (game: Game) => void): void;
    createLobby: (lobby: Lobby) => void;
    deleteLobby: () => void;
    getLobby: () => Promise<Lobby | null>;
    createGame: (game: Game) => Promise<void>;
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

    let gameUpdateListener: (game: Game) => void = () => { };

    networkService.setNetworkEventListener(data => {
        if (isLobbyUpdateNetworkEvent(data)) {
            getLobby(networkService).then(lobby => {
                if (lobby === null) return;

                lobbyUpdateListener(lobby);
            });
        } else if (isGameUpdateNetworkEvent(data)) {
            getGame(networkService).then(game => {
                if (game === null) return;

                gameUpdateListener(game);
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
        deleteLobby: () => networkService.deleteFile({
            fileName: LOBBY_FILE_NAME, folderName: ''
        }).then(() => networkService.broadcast({
            type: NetworkDataType.LOBBY_UPDATE
        })),
        getLobby: () => getLobby(networkService),
        setLobbyUpdateListener: (listener) => lobbyUpdateListener = listener,
        setGameUpdateListener: (listener) => gameUpdateListener = listener,
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

function isGameUpdateNetworkEvent(data: LabyrinthNetworkData): data is GameUpdateNetworkEvent {
    return data.type === NetworkDataType.GAME_UPDATE;
}
