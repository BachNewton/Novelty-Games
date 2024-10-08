import { Team } from "../logic/Data";
import { getVisibleBattleCard, getVisibleSpeedCard } from "../logic/Rules";
import CardUi from "./Card";
import DistanceArea from './DistanceArea';
import SafetyArea from './SafetyArea';
import { addHighlight, getTeamName } from "./UiUtil";

interface TableauProps {
    team: Team;
    onClick?: () => void;
    isHighlighted?: boolean;
    greyedOut?: boolean;
    remainingDistance: number;
}

const Tableau: React.FC<TableauProps> = ({ team, onClick, isHighlighted, greyedOut, remainingDistance }) => {
    const tableauData = team.tableau;

    const tableauStyle: React.CSSProperties = {
        borderColor: team.color,
        borderWidth: '1px',
        borderStyle: 'solid',
        boxSizing: 'border-box',
        display: 'grid',
        minHeight: 0,
        margin: '2% 0',
        opacity: greyedOut ? 0.1 : 1
    };

    if (isHighlighted) {
        addHighlight(tableauStyle);
    }

    return <div style={tableauStyle} onClick={onClick} >
        <div style={{ textAlign: 'center' }}>
            <strong>{getTeamName(team)}</strong> has <strong>{remainingDistance}</strong> km to go!
        </div>

        <div style={{ display: 'grid', gridAutoFlow: 'column', justifyContent: 'center', minHeight: 0, gridTemplateColumns: '3fr 1fr' }}>

            <div style={{ display: 'grid', alignContent: 'center', justifyContent: 'center', minHeight: 0, gridTemplateRows: '1fr 2fr' }}>
                <SafetyArea safetyArea={tableauData.safetyArea} />
                <DistanceArea distanceArea={tableauData.distanceArea} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <CardUi card={getVisibleBattleCard(tableauData.battleArea)} />
                <CardUi card={getVisibleSpeedCard(tableauData.speedArea)} />
            </div>
        </div>
    </div >
}

export default Tableau;
