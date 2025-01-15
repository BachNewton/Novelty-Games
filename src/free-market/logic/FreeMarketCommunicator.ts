import { createNetworkService, GetFileResponse, NetworkedApplication, NetworkService, SaveFileResponse } from "../../util/NetworkService";
import { Invention } from "../data/Component";

const INVENTIONS_FILE = 'inventions.json';

export interface FreeMarketCommunicator {
    addInvention: (invention: Invention) => Promise<void>;
    getInventions: () => Promise<Invention[]>
}

interface FreeMarketServerData { }

export function createFreeMarketCommunicator(): FreeMarketCommunicator {
    const networkService = createNetworkService<FreeMarketServerData>(NetworkedApplication.FREE_MARKET);

    return {
        addInvention: (invention) => getInventions(networkService).then(async inventions => {
            inventions.push(invention);

            await networkService.saveFile({
                folderName: '',
                fileName: INVENTIONS_FILE,
                content: JSON.stringify(inventions)
            });
        }),
        getInventions: () => getInventions(networkService)
    };
}

async function getInventions(networkService: NetworkService<FreeMarketServerData>): Promise<Invention[]> {
    const response = await networkService.getFile({
        folderName: '',
        fileName: INVENTIONS_FILE
    });

    if (response.isSuccessful) {
        return JSON.parse(response.content!);
    } else {
        return [];
    }
}
