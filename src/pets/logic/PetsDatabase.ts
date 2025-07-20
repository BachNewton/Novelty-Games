import { createDatabase } from "../../util/database/v1/DatabaseImpl";
import { PetSave } from "../data/PetSave";

export interface PetsDatabase {
    getPets: () => Promise<PetSave[]>;
    savePet: (pet: PetSave) => void;
}

export function createPetsDatabase(): PetsDatabase {
    const database = createDatabase('pets', ['pets']);

    return {
        getPets: () => database.getAll('pets'),
        savePet: async (pet) => {
            await database.deleteRow('pets', row => pet.id === row.id);
            await database.add('pets', pet);
        }
    };
}
