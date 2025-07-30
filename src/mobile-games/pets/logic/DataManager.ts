import { DistanceAndBearing, Navigator } from "../../../util/geolocation/Navigator";
import { Pet } from "../data/Pet";
import { PET_DATA, PET_DATA_MAP, PetData } from "../data/PetData";
import { PetSave, State } from "../data/PetSave";
import { PetsDatabase } from "./PetsDatabase";
import { Interaction, Interactions } from "../data/Interaction";
import { Location } from "../../../util/geolocation/LocationService";

const CYCLE_TIME = 15 * 60 * 1000; // 15 minutes
const DISCOVERY_THRESHOLD = 0.050; // 50 meters
const LOW_FRIENDSHIP_THRESHOLD = 5;
export const INTERACTION_PER_CYCLE = 1;

export interface DataManager {
    getDefaultPets: () => Pet[];

    discoverPetInDatabase: (selectedTab: number) => PetSave;

    getPetsFromSave: (pets: Pet[]) => Promise<Pet[]>;

    updatePetsState: (pets: Pet[], selectedTab: number, forceNextCycle?: boolean) => Pet[];

    handleUpdatedLocation: (
        pet: Pet,
        location: Location | null,
        onPetDiscovered: () => void,
        distanceAndBearingUpdate: (distanceAndBearing: DistanceAndBearing) => void
    ) => void;

    getTextAndImage: (pet: Pet) => PetTextAndImage;

    handleInteraction: (type: keyof Interactions, interaction: Interaction, pet: Pet) => PetTextAndImage;

    areInteractionsEnabled: (pet: Pet) => boolean;

    calculateArrowRotation: (heading: number | null, distanceAndBearing: DistanceAndBearing | null) => number | null;
}

export interface PetTextAndImage {
    text: string | null;
    image: string | null;
}

export function createDataManager(database: PetsDatabase, navigator: Navigator): DataManager {
    return {
        getDefaultPets: getDefaultPets,

        discoverPetInDatabase: (selectedTab) => discoverPetInDatabase(database, selectedTab),

        getPetsFromSave: (pets) => getPetsFromSave(database, pets),

        updatePetsState: (pets, selectedTab, forceNextCycle = false) => updatePetsState(database, pets, selectedTab, forceNextCycle),

        handleUpdatedLocation: (pet, location, onPetDiscovered, distanceAndBearingUpdate) => handleUpdatedLocation(
            pet,
            navigator,
            location,
            onPetDiscovered,
            distanceAndBearingUpdate
        ),

        getTextAndImage: getTextAndImage,

        handleInteraction: (type, interaction, pet) => handleInteraction(type, interaction, pet, database),

        areInteractionsEnabled: areInteractionsEnabled,

        calculateArrowRotation: calculateArrowRotation
    };
}

function getDefaultPets(): Pet[] {
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

function discoverPetInDatabase(database: PetsDatabase, selectedTab: number): PetSave {
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

async function getPetsFromSave(database: PetsDatabase, pets: Pet[]): Promise<Pet[]> {
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

function updatePetsState(database: PetsDatabase, pets: Pet[], selectedTab: number, forceNextCycle: boolean): Pet[] {
    const selectedPet = pets[selectedTab];

    if (!selectedPet.discovered || selectedPet.nextCycle === null) return pets; // We don't need to udpate the state of undiscovered pets

    const nextCycle = selectedPet.nextCycle;
    const diff = nextCycle - Date.now();
    console.log(`${selectedPet.name} will change state in ${diff / 1000} seconds`);

    if (diff < 0 || forceNextCycle) {
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

function handleUpdatedLocation(
    pet: Pet,
    navigator: Navigator,
    location: Location | null,
    onPetDiscovered: () => void,
    distanceAndBearingUpdate: (distanceAndBearing: DistanceAndBearing) => void
) {
    if (pet.discovered || location === null) return; // Don't need to do any work if the pet is already discoverd

    const petData = getPetData(pet);

    const distanceAndBearing = navigator.calculateDistanceAndBearing(location, petData.location);

    if (distanceAndBearing.distance < DISCOVERY_THRESHOLD) {
        onPetDiscovered();
    } else {
        distanceAndBearingUpdate(distanceAndBearing);
    }
}

function getPetData(pet: Pet): PetData {
    return PET_DATA_MAP.get(pet.id)!;
}

function getTextAndImage(pet: Pet): PetTextAndImage {
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
            image: null
        };
    }
}

function handleInteraction(type: keyof Interactions, interaction: Interaction, pet: Pet, database: PetsDatabase): PetTextAndImage {
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

function areInteractionsEnabled(pet: Pet): boolean {
    return pet.discovered && pet.state === State.AWAKE && pet.interactionsThisCycle < INTERACTION_PER_CYCLE;
}

function calculateArrowRotation(heading: number | null, distanceAndBearing: DistanceAndBearing | null): number | null {
    if (heading === null || distanceAndBearing === null) return null;

    const bearing = distanceAndBearing.bearing;
    const rotation = (bearing - heading + 360) % 360;

    return rotation;
}
