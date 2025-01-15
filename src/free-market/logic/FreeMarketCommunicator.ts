import { createNetworkService, NetworkedApplication, SaveFileResponse } from "../../util/NetworkService";
import { Invention } from "../data/Component";

const INVENTIONS_FOLDER = 'inventions';

export interface FreeMarketCommunicator {
    saveInvention: (invention: Invention) => Promise<SaveFileResponse>;
}

interface FreeMarketServerData { }

export function createFreeMarketCommunicator(): FreeMarketCommunicator {
    const networkService = createNetworkService<FreeMarketServerData>(NetworkedApplication.FREE_MARKET);

    return {
        saveInvention: (invention) => networkService.saveFile({
            folderName: INVENTIONS_FOLDER,
            fileName: `${invention.id}.json`,
            content: JSON.stringify(invention)
        })
    };
}
