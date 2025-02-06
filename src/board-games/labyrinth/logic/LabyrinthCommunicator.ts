import { createNetworkService, NetworkedApplication, NetworkService } from "../../../util/NetworkService";
import { Lobby } from "../data/Lobby";

const LOBBY_FILE_NAME = 'lobby.json';

export interface LabyrinthCommunicator {
    setLobbyUpdateListener(listener: (lobby: Lobby) => void): void;
    createLobby: (lobby: Lobby) => void;
    getLobby: () => Promise<Lobby | null>;
}

enum NetworkDataType {
    LOBBY_UPDATE
}

interface LabyrinthNetworkData {
    type: NetworkDataType;
}

interface LobbyUpdateNetworkEvent extends LabyrinthNetworkData { }

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
        setLobbyUpdateListener: (listener) => lobbyUpdateListener = listener
    };
}

async function getLobby(networkService: NetworkService<LabyrinthNetworkData>): Promise<Lobby | null> {
    const response = await networkService.getFile({
        fileName: LOBBY_FILE_NAME,
        folderName: ''
    });

    return response.isSuccessful ? JSON.parse(response.content!) : null;
}

function isLobbyUpdateNetworkEvent(data: LabyrinthNetworkData): data is LobbyUpdateNetworkEvent {
    return data.type === NetworkDataType.LOBBY_UPDATE;
}
