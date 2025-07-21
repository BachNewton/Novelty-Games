import { Pet } from "../data/Pet";
import { PET_DATA } from "../data/PetData";
import { State } from "../data/PetSave";
import { PetsDatabase } from "./PetsDatabase";

const CYCLE_TIME = 2 * 1000; // 2 minutues

export function getDefaultPets(): Pet[] {
    return PET_DATA.map<Pet>(pet => {
        return {
            id: pet.id,
            name: pet.name,
            discovered: false,
            state: State.ASLEEP,
            nextCycle: -1
        };
    });
}

export function discoverPetInDatabase(database: PetsDatabase, selectedTab: number) {
    database.savePet({
        id: PET_DATA[selectedTab].id,
        state: State.AWAKE,
        nextCycle: Date.now() + CYCLE_TIME,
        discovered: true
    });
}
