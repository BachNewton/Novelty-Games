import { createNetworkService, NetworkedApplication } from "../../util/NetworkService";

export interface FreeMarketCommunicator { }

interface FreeMarketServerData { }

export function createFreeMarketCommunicator(): FreeMarketCommunicator {
    const networkService = createNetworkService<FreeMarketServerData>(NetworkedApplication.FREE_MARKET);

    return {};
}
