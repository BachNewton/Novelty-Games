import VerticalSpacer from "../../../util/ui/Spacer";
import { TOTAL_FIXED_INTERACTIONS } from "../data/Interaction";
import { Pet } from "../data/Pet";
import { PET_DATA } from "../data/PetData";
import { createOverviewData, PetBreakdown } from "../logic/OverviewData";
import { MAX_HEARTS } from "./FriendshipBar";
import { COLORS } from "./Home";

interface OverviewProps {
    pets: Pet[];
    seenInteractions: Set<string>;
}

const Overview: React.FC<OverviewProps> = ({ pets, seenInteractions }) => {
    const { breakdowns, summary } = createOverviewData(pets, seenInteractions);

    const breakdownUi = breakdowns.map((breakdown, index) => <div key={index} style={{
        border: `1px solid ${COLORS.primary}`,
        borderRadius: '15px',
        marginTop: '15px',
        padding: '10px',
        boxShadow: `0px 0px 10px ${COLORS.secondary}`
    }}>
        {petBreakdownUi(breakdown)}
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

            {rowUi('Pets Discovered', summary.discoveredPets, summary.totalPets)}
            {rowUi('Friendship Gained', summary.totalFriendship, summary.totalFriendship)}
            {rowUi('Interactinons Seen', summary.totalInteractions, summary.maxTotalInteractions)}
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

function petBreakdownUi(breakdown: PetBreakdown): JSX.Element {
    return <>
        <div style={{
            fontWeight: 'bold',
            color: COLORS.secondary,
            fontSize: '1.2em',
            marginBottom: '15px'
        }}>{breakdown.name}</div>

        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            paddingLeft: '30px'
        }}>
            {rowUi('Friendship', breakdown.friendship, breakdown.maxFriendship)}
            {rowUi('Interactions', breakdown.aquiredInteractions, breakdown.maxInteractions)}
        </div>
    </>;
}

export default Overview;
