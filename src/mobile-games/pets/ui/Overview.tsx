import VerticalSpacer from "../../../util/ui/Spacer";
import { Pet } from "../data/Pet";
import { createOverviewData, PetBreakdown } from "../logic/OverviewData";
import { COLORS } from "./Home";
import { menuBannerUi } from "./Menu";

interface OverviewProps {
    pets: Pet[];
    seenInteractions: Set<string>;
}

const Overview: React.FC<OverviewProps> = ({ pets, seenInteractions }) => {
    const { breakdowns, summary } = createOverviewData(pets, seenInteractions);

    const cardStyle: React.CSSProperties = {
        border: `1px solid ${COLORS.primary}`,
        borderRadius: '15px',
        padding: '10px',
        boxShadow: `0px 0px 10px ${COLORS.secondary}`
    };

    const headerStyle: React.CSSProperties = {
        marginBottom: '15px',
        fontSize: '1.25em',
        fontWeight: 'bold'
    };

    const breakdownUi = breakdowns.map((breakdown, index) => <div key={index} style={{
        marginTop: '20px',
        ...cardStyle
    }}>
        {petBreakdownUi(breakdown)}
    </div>);

    return <>
        {menuBannerUi(`${summary.overallCompletion.toFixed(2)}%`, 2)}

        <VerticalSpacer height={20} />

        <div style={headerStyle}>Overview</div>

        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            rowGap: '10px',
            ...cardStyle
        }}>
            {rowUi('Discoveries', summary.discoveredPets, summary.totalPets)}
            {rowUi('Friendship', summary.totalFriendship, summary.maxTotalFriendship)}
            {rowUi('Best Friends', summary.bestFriends, summary.totalPets)}
            {rowUi('Interactions', summary.totalInteractions, summary.maxTotalInteractions)}
        </div>

        <VerticalSpacer height={20} />

        <div style={headerStyle}>Breakdown</div>

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
    const bestFriendText = breakdown.isBestFriend ? 'Best Friend!' : '';

    return <>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: '1.2em',
            marginBottom: '15px'
        }}>
            <div style={{ color: COLORS.primary }}>{breakdown.name}</div>
            <div style={{ color: COLORS.secondary }}>{bestFriendText}</div>
            <div>{breakdown.overallCompletion.toFixed(1)}%</div>
        </div>

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
