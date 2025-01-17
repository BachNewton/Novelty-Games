import { createNetworkService, GetFileResponse, NetworkedApplication, NetworkService, SaveFileResponse } from "../../util/NetworkService";
import { Invention } from "../data/Component";
import { Inventor } from "../data/Inventor";

const INVENTIONS_FILE = 'inventions.json';
const INVENTORS_FILE = 'inventors.json';

export interface FreeMarketCommunicator {
    addInvention: (invention: Invention) => Promise<void>;
    getInventions: () => Promise<Invention[]>,
    addInventor: (inventor: Inventor) => Promise<void>;
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
        getInventions: () => getInventions(networkService),
        addInventor: (inventor) => getInventors(networkService).then(async inventors => {
            inventors.push(inventor);

            await networkService.saveFile({
                folderName: '',
                fileName: INVENTORS_FILE,
                content: JSON.stringify(inventors)
            });
        })
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

async function getInventors(networkService: NetworkService<FreeMarketServerData>): Promise<Inventor[]> {
    const response = await networkService.getFile({
        folderName: '',
        fileName: INVENTORS_FILE
    });

    if (response.isSuccessful) {
        return JSON.parse(response.content!);
    } else {
        return [];
    }
}
