import { createDatabase } from "../../util/database/v1/DatabaseImpl";
import { PetSave } from "../data/PetSave";

export interface PetsDatabase {
    getPets: () => Promise<Map<string, PetSave>>;
    savePet: (pet: PetSave) => void;
}

export function createPetsDatabase(): PetsDatabase {
    const database = createDatabase('pets', ['pets']);

    return {
        getPets: async () => new Map((await database.getAll('pets')).map(pet => [pet.id, pet])),
        savePet: async (pet) => {
            await database.deleteRow('pets', row => pet.id === row.id);
            await database.add('pets', pet);
        }
    };
}
