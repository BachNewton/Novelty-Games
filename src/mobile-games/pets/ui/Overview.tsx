import VerticalSpacer from "../../../util/ui/Spacer";
import { TOTAL_FIXED_INTERACTIONS } from "../data/Interaction";
import { Pet } from "../data/Pet";
import { PET_DATA } from "../data/PetData";
import { MAX_HEARTS } from "./FriendshipBar";
import { COLORS } from "./Home";

interface OverviewProps {
    pets: Pet[];
    seenInteractions: Set<string>;
}

const Overview: React.FC<OverviewProps> = ({ pets, seenInteractions }) => {
    const totalPets = pets.length;
    const discoveredPets = pets.filter(pet => pet.discovered).length;
    const totalFriendship = MAX_HEARTS * totalPets;
    const friendship = Math.min(totalFriendship, pets.reduce((sum, pet) => sum + pet.friendship, 0));
    const totalInteractions = PET_DATA.reduce(
        (sum, pet) => sum + TOTAL_FIXED_INTERACTIONS + pet.interactions.chat.size,
        0
    );
    const interactions = seenInteractions.size;

    const petsFriendship = new Map(pets.map(pet => [pet, Math.min(pet.friendship, MAX_HEARTS)]));

    const petInteractionIds = new Map(pets.map(pet => {
        const data = PET_DATA.find(data => data.id === pet.id);

        const interationIds = data === undefined ? [] : [
            data.interactions.pet.id,
            data.interactions.play.id,
            data.interactions.space.id,
            data.interactions.treat.id,
            ...Array.from(data.interactions.chat.values()).map(interaction => interaction.id)
        ];

        return [
            pet,
            interationIds
        ]
    }));

    const petsInteractions = new Map(pets.map(pet => [pet, {
        aquired: petInteractionIds.get(pet)?.reduce((sum, id) => sum + (seenInteractions.has(id) ? 1 : 0), 0) ?? 0,
        total: petInteractionIds.get(pet)?.length ?? 0
    }]));

    const breakdownUi = pets.map((pet, index) => <div key={index} style={{
        border: `1px solid ${COLORS.primary}`,
        borderRadius: '15px',
        marginTop: '15px',
        padding: '10px',
        boxShadow: `0px 0px 10px ${COLORS.secondary}`
    }}>
        {petBreakdownUi(pet, petsFriendship, petsInteractions)}
    </div>);

    return <>
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            rowGap: '15px'
        }}>
            <div style={{
                gridColumn: 'span 4',
                fontSize: '2em',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '15px'
            }}>100.00%</div>

            {rowUi('Pets Discovered', discoveredPets, totalPets)}
            {rowUi('Friendship Gained', friendship, totalFriendship)}
            {rowUi('Interactinons Seen', interactions, totalInteractions)}
        </div>

        <VerticalSpacer height={15} />

        {breakdownUi}
    </>;
};

function rowUi(label: string, acquired: number, total: number): JSX.Element {
    return <>
        <div style={{ gridColumn: 'span 2' }}>{label}:</div>
        <div style={{ textAlign: 'right' }}>{acquired} / {total}</div>
        <div style={{ textAlign: 'right' }}>{(100 * acquired / total).toFixed(1)}%</div>
    </>;
}

function petBreakdownUi(pet: Pet, petsFriendship: Map<Pet, number>, petsInteractions: Map<Pet, { aquired: number; total: number; }>): JSX.Element {
    const friendship = petsFriendship.get(pet) ?? 0;
    const interactions = petsInteractions.get(pet) ?? { aquired: 0, total: 0 };

    return <>
        <div style={{
            fontWeight: 'bold',
            color: COLORS.secondary,
            fontSize: '1.2em',
            marginBottom: '15px'
        }}>{pet.discovered ? pet.name : '???'}</div>

        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            paddingLeft: '30px'
        }}>
            {rowUi('Friendship', friendship, MAX_HEARTS)}
            {rowUi('Interactions', interactions.aquired, interactions.total)}
        </div>
    </>;
}

export default Overview;
