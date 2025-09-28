import { Pet } from "../data/Pet";
import { PET_DATA } from "../data/PetData";
import { MAX_HEARTS } from "../ui/FriendshipBar";

export interface OverviewData {
    breakdowns: PetBreakdown[];
    summary: Summary;
}

export interface PetBreakdown {
    isDiscovered: boolean;
    name: string;
    maxFriendship: number;
    friendship: number;
    isBestFriend: boolean;
    maxInteractions: number;
    aquiredInteractions: number;
    overallCompletion: number;
}

interface Summary {
    totalPets: number;
    discoveredPets: number;
    totalFriendship: number;
    maxTotalFriendship: number;
    bestFriends: number;
    totalInteractions: number;
    maxTotalInteractions: number;
    overallCompletion: number;
}

export function createOverviewData(
    pets: Pet[],
    seenInteractions: Set<string>
): OverviewData {
    const totalPets = pets.length;

    let discoveredPets = 0;
    let totalFriendship = 0;
    let maxTotalFriendship = 0;
    let bestFriends = 0;
    let totalInteractions = 0
    let maxTotalInteractions = 0;

    const breakdowns = pets.map<PetBreakdown>(pet => {
        const isDiscovered = pet.discovered;
        discoveredPets += isDiscovered ? 1 : 0;

        const name = isDiscovered ? pet.name : '???';

        const maxFriendship = MAX_HEARTS;
        maxTotalFriendship += maxFriendship;

        const friendship = Math.min(pet.friendship, maxFriendship);
        totalFriendship += friendship;

        const isBestFriend = friendship >= maxFriendship;
        bestFriends += isBestFriend ? 1 : 0;

        const interactionIds = getInteractionIds(pet);

        const maxInteractions = interactionIds.length;
        maxTotalInteractions += maxInteractions;

        const aquiredInteractions = countAquiredInteractions(interactionIds, seenInteractions);
        totalInteractions += aquiredInteractions;

        const overallCompletion =
            ((isDiscovered ? 1 : 0) + (isBestFriend ? 1 : 0) + friendship + aquiredInteractions)
            /
            (1 + 1 + maxFriendship + maxInteractions);

        return {
            isDiscovered: isDiscovered,
            name: name,
            maxFriendship: maxFriendship,
            friendship: friendship,
            isBestFriend: isBestFriend,
            maxInteractions: maxInteractions,
            aquiredInteractions: aquiredInteractions,
            overallCompletion: overallCompletion * 100
        };
    });

    const overallCompletion =
        (discoveredPets + totalFriendship + bestFriends + totalInteractions)
        /
        (totalPets + maxTotalFriendship + totalPets + maxTotalInteractions);


    return {
        breakdowns: breakdowns,
        summary: {
            overallCompletion: overallCompletion * 100,
            totalPets: totalPets,
            discoveredPets: discoveredPets,
            totalFriendship: totalFriendship,
            maxTotalFriendship: maxTotalFriendship,
            bestFriends: bestFriends,
            totalInteractions: totalInteractions,
            maxTotalInteractions: maxTotalInteractions
        }
    };
}

function getInteractionIds(pet: Pet): string[] {
    const data = PET_DATA.find(data => data.id === pet.id);

    if (data === undefined) return [];

    return [
        data.interactions.pet.id,
        data.interactions.play.id,
        data.interactions.space.id,
        data.interactions.treat.id,
        ...Array
            .from(data.interactions.chat)
            .map(([, interaction]) => interaction.id)
    ];
}

function countAquiredInteractions(interactionIds: string[], seenInteractions: Set<string>): number {
    return interactionIds.reduce(
        (sum, id) => sum + (seenInteractions.has(id) ? 1 : 0),
        0
    ) ?? 0;
}
