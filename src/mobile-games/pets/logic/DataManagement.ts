import { DistanceAndDirection, Navigator } from "../../../util/geolocation/Navigator";
import { Pet } from "../data/Pet";
import { PET_DATA, PET_DATA_MAP, PetData } from "../data/PetData";
import { PetSave, State } from "../data/PetSave";
import { PetsDatabase } from "./PetsDatabase";
import HiddenImage from "../images/hidden.png";
import { Interaction, Interactions } from "../data/Interaction";

const CYCLE_TIME = 15 * 1000; // 15 seconds
const DISCOVERY_THRESHOLD = 0.050; // 50 meters
const LOW_FRIENDSHIP_THRESHOLD = 5;
const INTERACTION_PER_CYCLE = 1;

export interface PetTextAndImage {
    text: string;
    image: string;
}

export function getDefaultPets(): Pet[] {
    return PET_DATA.map<Pet>(pet => {
        return {
            id: pet.id,
            name: pet.name,
            discovered: false,
            state: State.ASLEEP,
            nextCycle: null,
            distanceAndDirection: null,
            friendship: 0,
            interactionsThisCycle: 0
        };
    });
}

export function discoverPetInDatabase(database: PetsDatabase, selectedTab: number): PetSave {
    const petSave: PetSave = {
        id: PET_DATA[selectedTab].id,
        state: State.AWAKE,
        nextCycle: Date.now() + CYCLE_TIME,
        discovered: true,
        friendship: 0,
        interactionsThisCycle: 0
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
        selectedPet.interactionsThisCycle = 0;
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

export function distanceAndDirectionHandler(
    pet: Pet,
    navigator: Navigator,
    onPetDiscovered: () => void,
    onDistanceAndDirectionUpdate: (calculatedDistanceAndDirection: DistanceAndDirection) => void
) {
    if (pet.discovered) return; // Don't need to check location if the pet is already discoverd

    const petData = PET_DATA_MAP.get(pet.id)!;

    navigator.calculateDistanceAndDirectionTo(petData.location).then(calculatedDistanceAndDirection => {
        if (calculatedDistanceAndDirection.distance < DISCOVERY_THRESHOLD) {
            onPetDiscovered();
        } else {
            onDistanceAndDirectionUpdate(calculatedDistanceAndDirection);
        }
    });
}

function getPetData(pet: Pet): PetData {
    return PET_DATA_MAP.get(pet.id)!;
}

export function getTextAndImage(pet: Pet): PetTextAndImage {
    const dialogue = getPetData(pet).dialogue;
    const images = getPetData(pet).images;

    if (pet.discovered) {
        switch (pet.state) {
            case State.AWAKE:
                if (pet.friendship < LOW_FRIENDSHIP_THRESHOLD) {
                    return {
                        text: dialogue.greeting.lowFriendship,
                        image: images.greetLowFriendship
                    };
                } else {
                    return {
                        text: dialogue.greeting.highFriendship,
                        image: images.greetHighFriendShip
                    };
                }
            case State.ASLEEP:
                return {
                    text: dialogue.sleeping,
                    image: images.sleep
                };
        }
    } else {
        return {
            text: dialogue.hidden,
            image: HiddenImage
        };
    }
}

export function handleInteraction(type: keyof Interactions, interaction: Interaction, pet: Pet, database: PetsDatabase): PetTextAndImage {
    pet.friendship++; // For now friendship increases by just 1 after an interaction
    pet.interactionsThisCycle++;
    database.savePet(pet);

    return {
        text: interaction.text,
        image: getInteractionImage(type, pet)
    };
}

function getInteractionImage(type: keyof Interactions, pet: Pet): string {
    const images = getPetData(pet).images;

    switch (type) {
        case 'chat':
            return images.chat;
        case 'pet':
            return images.pet;
        case 'play':
            return images.play;
        case 'space':
            return images.space;
        case 'treat':
            return images.treat;
    }
}

export function areInteractionsEnabled(pet: Pet): boolean {
    return pet.discovered && pet.state === State.AWAKE && pet.interactionsThisCycle < INTERACTION_PER_CYCLE;
}
