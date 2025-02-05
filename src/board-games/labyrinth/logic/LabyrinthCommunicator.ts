import { createNetworkService, NetworkedApplication } from "../../../util/NetworkService";
import { Player } from "../data/Player";

export interface LabyrinthCommunicator {
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
        updateLobby: (data) => networkService.broadcast(data),
        setLobbyUpdateListener: (listener) => lobbyUpdateListener = listener
    };
}

function isLobbyNetworkData(data: LabyrinthNetworkData): data is LobbyNetworkData {
    return data.type === 'lobby';
}
