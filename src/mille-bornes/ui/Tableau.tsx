import '../css/Cards.css';
import { Tableau as TableauData } from "../logic/Data";
import CardUi from "./Card";
import DistanceArea from './DistanceArea';

interface TableauProps {
    tableauData: TableauData;
}

const Tableau: React.FC<TableauProps> = ({ tableauData }) => {
    const safetyCards = tableauData.safetyArea.map((safetyCard, index) =>
        <CardUi card={safetyCard} key={index} />
    );

    const battleCard = <CardUi card={tableauData.battleArea} />;
    const speedCard = <CardUi card={tableauData.speedArea} />;

    return <div style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="cards" style={{ minHeight: 0 }}>
            {safetyCards}
        </div>
        <div style={{ display: 'flex', minHeight: 0 }}>
            <DistanceArea distanceArea={tableauData.distanceArea} />
            <div style={{ marginLeft: '5%', display: 'flex', flexDirection: 'column' }}>
                {battleCard}
                {speedCard}
            </div>
        </div>
    </div>;
}

export default Tableau;
