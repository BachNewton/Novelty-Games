import { Pet } from "../data/Pet";
import { PET_DATA } from "../data/PetData";
import { State } from "../data/PetSave";

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
