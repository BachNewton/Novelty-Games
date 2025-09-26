import { TOTAL_FIXED_INTERACTIONS } from "../data/Interaction";
import { Pet } from "../data/Pet";
import { PET_DATA } from "../data/PetData";
import { MAX_HEARTS } from "./FriendshipBar";

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

    return <div style={{
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
    </div>;
};

function rowUi(label: string, acquired: number, total: number): JSX.Element {
    return <>
        <div style={{ gridColumn: 'span 2' }}>{label}:</div>
        <div style={{ textAlign: 'right' }}>{acquired} / {total}</div>
        <div style={{ textAlign: 'right' }}>{(100 * acquired / total).toFixed(1)}%</div>
    </>;
}

export default Overview;
