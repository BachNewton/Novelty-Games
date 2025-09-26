import { Pet } from "../data/Pet";

interface OverviewProps {
    pets: Pet[];
    seenInteractions: Set<string>;
}

const Overview: React.FC<OverviewProps> = ({ pets, seenInteractions }) => {
    const discoveredPets = pets.filter(pet => pet.discovered).length;
    const totalPets = pets.length;

    return <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)'
    }}>
        <div style={{
            gridColumn: 'span 4',
            fontSize: '2em',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '15px'
        }}>100.00%</div>

        <div style={{ gridColumn: 'span 2' }}>Pets Discovered:</div>
        <div style={{ textAlign: 'right' }}>{discoveredPets} / {totalPets}</div>
        <div style={{ textAlign: 'right' }}>{(100 * discoveredPets / totalPets).toFixed(1)}%</div>
    </div>;
};

export default Overview;
