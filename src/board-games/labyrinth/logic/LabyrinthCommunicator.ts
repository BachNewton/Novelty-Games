import { createNetworkService, NetworkedApplication } from "../../../util/NetworkService";

export interface LabyrinthCommunicator { }

interface LabyrinthNetworkData { }

export function createLabyrinthCommunicator(): LabyrinthCommunicator {
    const networkService = createNetworkService<LabyrinthNetworkData>(NetworkedApplication.LABYRINTH);

    return {};
}
