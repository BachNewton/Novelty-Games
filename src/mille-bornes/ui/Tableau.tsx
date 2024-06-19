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

    const distanceCards = [25, 50, 75, 100, 200].map((amount, index) => {
        const distanceCards = tableauData.distanceArea.filter(distanceCard => distanceCard.amount === amount);

        const distanceCardsUi = distanceCards.map((distanceCard, index) =>
            <CardUi card={distanceCard} translateY={index * -90} key={index} />
        );

        return <div key={index}>
            {distanceCardsUi}
        </div>;
    });

    const battleCard = <CardUi card={tableauData.battleArea} />;
    const speedCard = <CardUi card={tableauData.speedArea} />;

    return <div style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="cards" style={{ minHeight: 0 }}>
            {safetyCards}
        </div>
        <div style={{ display: 'flex', flexGrow: 1, minHeight: 0 }}>
            <div className="cards" style={{ flexGrow: 1, height: '0px' }}>
                {distanceCards}
            </div>
            <div style={{ flexGrow: 1, marginLeft: '5%', display: 'flex', flexDirection: 'column' }}>
                {battleCard}
                {speedCard}
            </div>
        </div>
    </div>;
}

export default Tableau;
