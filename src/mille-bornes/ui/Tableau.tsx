import '../css/Cards.css';
import { Tableau as TableauData } from "../logic/Data";
import CardUi from "./Card";

interface TableauProps {
    tableauData: TableauData;
}

const Tableau: React.FC<TableauProps> = ({ tableauData }) => {
    const safetyCards = tableauData.safetyArea.map((safetyCard, index) =>
        <CardUi card={safetyCard} key={index} />
    );

    const distanceCards = tableauData.distanceArea.map((distanceCard, index) =>
        <CardUi card={distanceCard} key={index} />
    );

    const battleCard = <CardUi card={tableauData.battleArea} />;
    const speedCard = <CardUi card={tableauData.speedArea} />;

    return <div>
        <div className="cards">
            {safetyCards}
        </div>
        <div style={{ display: 'flex' }}>
            <div className="cards" style={{ flexGrow: 1 }}>
                {distanceCards}
            </div>
            <div style={{ flexGrow: 1, marginLeft: '15px' }}>
                {battleCard}
                {speedCard}
            </div>
        </div>
    </div>;
}

export default Tableau;
