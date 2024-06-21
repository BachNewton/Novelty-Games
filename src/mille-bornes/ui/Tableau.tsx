import { Tableau as TableauData, Team } from "../logic/Data";
import CardUi from "./Card";
import DistanceArea from './DistanceArea';
import SafetyArea from './SafetyArea';

interface TableauProps {
    team: Team;
}

const Tableau: React.FC<TableauProps> = ({ team }) => {
    const tableauData = team.tableau;
    const teamName = 'Team ' + team.players.map(player => player.name).join(' & ');

    return <div style={{ display: 'grid', minHeight: 0, padding: '2% 0' }} >
        <div style={{ textAlign: 'center' }}>{teamName}</div>

        <div style={{ display: 'grid', gridAutoFlow: 'column', justifyContent: 'space-evenly', minHeight: 0 }}>

            <div style={{ display: 'grid', alignContent: 'center', minHeight: 0 }}>
                <SafetyArea safetyArea={tableauData.safetyArea} />
                <DistanceArea distanceArea={tableauData.distanceArea} />
            </div>

            <div style={{ display: 'grid', minHeight: 0 }}>
                <CardUi card={tableauData.battleArea} />
                <CardUi card={tableauData.speedArea} />
            </div>
        </div>
    </div >
}

export default Tableau;
