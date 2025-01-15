import { createNetworkService, NetworkedApplication, SaveFileResponse } from "../../util/NetworkService";
import { Invention } from "../data/Component";

const INVENTIONS_FILE = 'inventions.json';

export interface FreeMarketCommunicator {
    addInvention: (invention: Invention) => Promise<SaveFileResponse>;
}

interface FreeMarketServerData { }

export function createFreeMarketCommunicator(): FreeMarketCommunicator {
    const networkService = createNetworkService<FreeMarketServerData>(NetworkedApplication.FREE_MARKET);

    return {
        addInvention: (invention) => networkService.getFile({
            folderName: '',
            fileName: INVENTIONS_FILE
        }).then(response => {
            if (response.isSuccessful) {
                const inventions: Invention[] = JSON.parse(response.content!);

                inventions.push(invention);

                return networkService.saveFile({
                    folderName: '',
                    fileName: INVENTIONS_FILE,
                    content: JSON.stringify(inventions)
                });
            } else {
                return networkService.saveFile({
                    folderName: '',
                    fileName: INVENTIONS_FILE,
                    content: JSON.stringify([invention])
                });
            }
        })
    };
}
