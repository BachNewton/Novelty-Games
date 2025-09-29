import { createDatabase } from "../../../util/database/v1/DatabaseImpl";
import { Pet } from "../data/Pet";
import { PetsDatabase } from "./PetsDatabase";

export interface PetsDebugger {
    resetAllData: () => void;
    nextCycle: (pet: Pet) => string;
    setHighFriendship: (pet: Pet) => void;
}

export function createPetsDebugger(
    database: PetsDatabase,
    setDebugMenuButtonToVisible: () => void
): PetsDebugger {
    (window as any).debug = () => {
        setDebugMenuButtonToVisible();

        return 'Pet game debug button has been enabled';
    };

    return {
        resetAllData: async () => {
            await createDatabase('pets', []).delete();
            window.location.reload();
        },
        nextCycle: (pet) => {
            if (pet.nextCycle === null) return 'N/A';

            return `${((pet.nextCycle - Date.now()) / 1000).toFixed(0)}s`;
        },
        setHighFriendship: async (pet) => {
            pet.friendship = 100;
            await database.savePet(pet);
        }
    };
}
