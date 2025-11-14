import { createNetworkService, NetworkedApplication, NetworkService } from "../../../util/networking/NetworkService";
import { Ride } from "../data/Ride";
import { ServerEnv } from "../data/Save";

const FOLDER_NAME = 'rides';
// const DEV_FILE_NAME = 'dev-rides.json';
// const PROD_FILE_NAME = 'rides.json';
const CHALLENGE_FILE_NAME = 'rides-offical-challenge.json';

export interface WinterCyclingNetworking {
    getRides: () => Promise<Ride[]>;
    submitRide: (ride: Ride) => Promise<Ride[]>;
    setEnvironment: (env: ServerEnv) => Promise<Ride[]>;
}

export function createWinterCyclingNetworking(): WinterCyclingNetworking {
    const networkService = createNetworkService<void>(NetworkedApplication.WINTER_CYCLING);
    let fileName = CHALLENGE_FILE_NAME; // DEV_FILE_NAME;

    return {
        getRides: () => getRides(networkService, fileName),

        submitRide: async (ride) => {
            const rides = await getRides(networkService, fileName);

            rides.push(ride);

            const saveResponse = await networkService.saveFile({
                folderName: FOLDER_NAME,
                fileName: fileName,
                content: JSON.stringify(rides)
            });

            if (saveResponse.isSuccessful) {
                return rides;
            } else {
                throw new Error('Failed to submit ride');
            }
        },


        setEnvironment: async (env) => {
            fileName = CHALLENGE_FILE_NAME; // env === ServerEnv.DEVELOPMENT ? DEV_FILE_NAME : PROD_FILE_NAME;

            return getRides(networkService, fileName);
        }
    }
}

async function getRides(networkService: NetworkService<void>, fileName: string): Promise<Ride[]> {
    const resposne = await networkService.getFile({
        folderName: FOLDER_NAME,
        fileName: fileName
    });

    const rides: Ride[] = resposne.isSuccessful
        ? JSON.parse(resposne.content as string)
        : [];

    console.log('Rides from server:', rides);

    return rides;
}
