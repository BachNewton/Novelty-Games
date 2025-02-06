import { createNetworkService, NetworkedApplication } from "../../../util/NetworkService";
import { Lobby } from "../data/Lobby";
import { Player } from "../data/Player";

const LOBBY_FILE_NAME = 'lobby.json';

export interface LabyrinthCommunicator {
    createLobby: (lobby: Lobby) => void;
    getLobby: () => Promise<Lobby | null>;
    updateLobby: (data: LobbyNetworkData) => void;
    setLobbyUpdateListener: (listener: (data: LobbyNetworkData) => void) => void;
}

interface LabyrinthNetworkData {
    type: 'lobby';
}

interface LobbyNetworkData extends LabyrinthNetworkData {
    type: 'lobby';
    players: Player[];
}

export function createLabyrinthCommunicator(): LabyrinthCommunicator {
    const networkService = createNetworkService<LabyrinthNetworkData>(NetworkedApplication.LABYRINTH);

    let lobbyUpdateListener: (data: LobbyNetworkData) => void = () => { };

    networkService.setNetworkEventListener(data => {
        if (isLobbyNetworkData(data)) {
            lobbyUpdateListener(data);
        }
    });

    return {
        createLobby: (lobby) => networkService.saveFile({
            fileName: LOBBY_FILE_NAME,
            folderName: '',
            content: JSON.stringify(lobby)
        }),
        getLobby: () => networkService.getFile({
            fileName: LOBBY_FILE_NAME,
            folderName: ''
        }).then(response => response.isSuccessful ? JSON.parse(response.content!) : null),
        updateLobby: (data) => networkService.broadcast(data),
        setLobbyUpdateListener: (listener) => lobbyUpdateListener = listener
    };
}

function isLobbyNetworkData(data: LabyrinthNetworkData): data is LobbyNetworkData {
    return data.type === 'lobby';
}
