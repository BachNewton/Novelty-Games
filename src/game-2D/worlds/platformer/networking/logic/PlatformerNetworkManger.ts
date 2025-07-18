import { Player } from "../../../../../board-games/mille-bornes/logic/Data";
import { createNetworkService, NetworkedApplication } from "../../../../../util/networking/NetworkService";
import { PlayerData } from "../data/PlayerData";

export interface PlatormerNetworkManager {
    update: (player: Player) => void;
}

export function createPlatormerNetworkManager(): PlatormerNetworkManager {
    const networkService = createNetworkService<PlayerData>(NetworkedApplication.PLATFORMER);

    return {
        update: (player) => {
            //
        }
    };
}
