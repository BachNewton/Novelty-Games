import { Pet } from "../data/Pet";
import { PET_DATA } from "../data/PetData";
import { PetSave, State } from "../data/PetSave";
import { PetsDatabase } from "./PetsDatabase";

const CYCLE_TIME = 15 * 1000; // 15 seconds

export function getDefaultPets(): Pet[] {
    return PET_DATA.map<Pet>(pet => {
        return {
            id: pet.id,
            name: pet.name,
            discovered: false,
            state: State.ASLEEP,
            nextCycle: null,
            distanceAndDirection: null
        };
    });
}

export function discoverPetInDatabase(database: PetsDatabase, selectedTab: number): PetSave {
    const petSave: PetSave = {
        id: PET_DATA[selectedTab].id,
        state: State.AWAKE,
        nextCycle: Date.now() + CYCLE_TIME,
        discovered: true
    };

    database.savePet(petSave);

    return petSave;
}

export async function updatePetsFromSave(database: PetsDatabase, pets: Pet[]): Promise<Pet[]> {
    const savedPets = await database.getPets();
    console.log('Saved pets:', savedPets);

    return pets.map(pet => {
        if (savedPets.has(pet.id)) {
            const savedPet = savedPets.get(pet.id)!;

            return {
                ...pet,
                ...savedPet
            };
        }

        return pet;
    });
}

export function updatePetsState(database: PetsDatabase, pets: Pet[], selectedTab: number): Pet[] {
    const selectedPet = pets[selectedTab];

    if (!selectedPet.discovered || selectedPet.nextCycle === null) return pets; // We don't need to udpate the state of undiscovered pets

    const nextCycle = selectedPet.nextCycle;
    const diff = nextCycle - Date.now();
    console.log(`${selectedPet.name} will change state in ${diff / 1000} seconds`);

    if (diff < 0) {
        selectedPet.nextCycle = Date.now() + CYCLE_TIME;
        selectedPet.state = cycleState(selectedPet.state);
        database.savePet(selectedPet);

        return [...pets];
    }

    return pets;
}

function cycleState(state: State): State {
    switch (state) {
        case State.ASLEEP:
            return State.AWAKE;
        case State.AWAKE:
            return State.ASLEEP;
    }
}
