import { createNetworkService, NetworkedApplication, NetworkService } from "../../../util/networking/NetworkService";
import { Ride } from "../data/Ride";

const FOLDER_NAME = 'rides';
const DEV_FILE_NAME = 'dev-rides.json';
const PROD_FILE_NAME = 'rides.json';

export interface WinterCyclingNetworking {
    getRides: () => Promise<Ride[]>;
    submitRide: (ride: Ride) => Promise<Ride[]>;
}

export function createWinterCyclingNetworking(): WinterCyclingNetworking {
    const networkService = createNetworkService<void>(NetworkedApplication.WINTER_CYCLING);

    return {
        getRides: () => getRides(networkService),

        submitRide: async (ride) => {
            const rides = await getRides(networkService);

            rides.push(ride);

            const saveResponse = await networkService.saveFile({
                folderName: FOLDER_NAME,
                fileName: DEV_FILE_NAME,
                content: JSON.stringify(rides)
            });

            if (saveResponse.isSuccessful) {
                return rides;
            } else {
                throw new Error('Failed to submit ride');
            }
        }
    };
}

async function getRides(networkService: NetworkService<void>): Promise<Ride[]> {
    const resposne = await networkService.getFile({
        folderName: FOLDER_NAME,
        fileName: DEV_FILE_NAME
    });

    const rides: Ride[] = resposne.isSuccessful
        ? JSON.parse(resposne.content as string)
        : [];

    console.log('Rides from server:', rides);

    return rides;
}
