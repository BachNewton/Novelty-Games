import { createDatabase } from "../../util/database/v1/DatabaseImpl";
import { Pet } from "../data/Pet";

export interface PetsDebugger {
    resetAllData: () => void;
    nextCycle: (pet: Pet) => string;
}

export function createPetsDebugger(): PetsDebugger {
    return {
        resetAllData: async () => {
            await createDatabase('pets', []).delete();
            window.location.reload();
        },
        nextCycle: (pet) => {
            if (pet.nextCycle === null) return 'N/A';

            return `${((pet.nextCycle - Date.now()) / 1000).toFixed(0)}s`;
        }
    };
}
